const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Attendance = require('../models/Attendance');
const { normalizeAttendanceDateInput } = require('../utils/date');
const { buildAttendancePayloadHash } = require('../utils/attendance');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const APPLY = process.argv.includes('--apply');

const buildAttendanceKey = (doc) => {
  const attendanceDate = normalizeAttendanceDateInput(doc.attendanceDate || doc.date);
  return `${String(doc.course)}::${attendanceDate}`;
};

const mergeAttendanceDocuments = (documents) => {
  const sortedDocs = [...documents].sort((left, right) => {
    const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
    const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
    return rightTime - leftTime;
  });

  const keeper = sortedDocs[0];
  const mergedRecordMap = new Map();

  for (const doc of sortedDocs) {
    for (const record of doc.records || []) {
      const studentKey = String(record.studentId);
      if (!mergedRecordMap.has(studentKey)) {
        mergedRecordMap.set(studentKey, {
          studentId: record.studentId,
          status: record.status,
        });
      }
    }
  }

  return {
    keeper,
    duplicates: sortedDocs.slice(1),
    mergedRecords: [...mergedRecordMap.values()],
    mergedPayloadHash: buildAttendancePayloadHash([...mergedRecordMap.values()]),
  };
};

const main = async () => {
  if (!MONGO_URI) {
    throw new Error('Missing MONGO_URI.');
  }

  await mongoose.connect(MONGO_URI);

  const attendanceDocs = await Attendance.find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  const grouped = new Map();
  for (const doc of attendanceDocs) {
    const key = buildAttendanceKey(doc);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(doc);
  }

  const duplicateGroups = [...grouped.entries()].filter(([, docs]) => docs.length > 1);

  if (!duplicateGroups.length) {
    console.log('No duplicate attendance groups found.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${duplicateGroups.length} duplicate attendance group(s).`);

  for (const [groupKey, docs] of duplicateGroups) {
    const { keeper, duplicates, mergedRecords, mergedPayloadHash } = mergeAttendanceDocuments(docs);

    console.log(`\nGroup: ${groupKey}`);
    console.log(`Keeping: ${keeper._id}`);
    console.log(`Removing: ${duplicates.map((doc) => String(doc._id)).join(', ')}`);
    console.log(`Merged records: ${mergedRecords.length}`);

    if (!APPLY) {
      continue;
    }

    const cleanupNote = `Migration cleanup merged ${duplicates.length + 1} legacy attendance documents into one canonical record.`;
    const now = new Date();

    await Attendance.updateOne(
      { _id: keeper._id },
      {
        $set: {
          attendanceDate: normalizeAttendanceDateInput(keeper.attendanceDate || keeper.date),
          records: mergedRecords,
          correctionReason: cleanupNote,
          lastPayloadHash: mergedPayloadHash,
          updatedAt: now,
        },
        $inc: { revision: 1 },
        $push: {
          auditLog: {
            action: 'updated',
            changedBy: keeper.updatedBy || keeper.markedBy,
            changedAt: now,
            correctionReason: cleanupNote,
            requestId: 'migration-cleanup',
            payloadHash: mergedPayloadHash,
          },
        },
      }
    );

    await Attendance.deleteMany({
      _id: { $in: duplicates.map((doc) => doc._id) },
    });
  }

  console.log(APPLY ? '\nDuplicate cleanup applied successfully.' : '\nDry run complete. Re-run with --apply to modify data.');
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Duplicate cleanup failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_disconnectError) {
    // ignore disconnect errors on failure path
  }
  process.exit(1);
});

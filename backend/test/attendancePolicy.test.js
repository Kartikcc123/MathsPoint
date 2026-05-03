const assert = require('node:assert/strict');

const {
  canParentAccessStudent,
  ensureTeacherCanManageCourse,
  hasDuplicateStudentIds,
  resolveCorrectionReason,
} = require('../utils/attendance');
const { AppError } = require('../utils/api');

const run = (name, fn) => {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

run('duplicate attendance prevention detects repeated student ids', () => {
  const duplicates = hasDuplicateStudentIds([
    { studentId: 'student-1', status: 'Present' },
    { studentId: 'student-2', status: 'Absent' },
    { studentId: 'student-1', status: 'Late' },
  ]);

  assert.deepEqual(duplicates, ['student-1']);
});

run('parent access restriction only allows linked children', () => {
  const parentUser = {
    linkedStudents: [{ _id: 'student-1' }, { _id: 'student-2' }],
  };

  assert.equal(canParentAccessStudent(parentUser, 'student-1'), true);
  assert.equal(canParentAccessStudent(parentUser, 'student-3'), false);
});

run('teacher course restriction blocks unassigned course access', () => {
  const teacher = {
    role: 'teacher',
    taughtCourses: [{ _id: 'course-1' }],
  };

  assert.doesNotThrow(() => ensureTeacherCanManageCourse(teacher, 'course-1'));
  assert.throws(
    () => ensureTeacherCanManageCourse(teacher, 'course-2'),
    (error) => error instanceof AppError && error.code === 'COURSE_ACCESS_DENIED'
  );
});

run('same-day overwrite logic creates safe fallback correction reason for legacy admin updates', () => {
  const reason = resolveCorrectionReason({
    existingAttendance: { _id: 'attendance-1' },
    existingPayloadHash: 'old-hash',
    nextPayloadHash: 'new-hash',
    correctionReason: '',
  });

  assert.match(reason, /Compatibility fallback/);
});

run('same-day overwrite logic preserves explicit correction reason when provided', () => {
  const reason = resolveCorrectionReason({
    existingAttendance: { _id: 'attendance-1' },
    existingPayloadHash: 'old-hash',
    nextPayloadHash: 'new-hash',
    correctionReason: 'Teacher corrected late arrival',
  });

  assert.equal(reason, 'Teacher corrected late arrival');
});

console.log('All attendance policy tests passed.');

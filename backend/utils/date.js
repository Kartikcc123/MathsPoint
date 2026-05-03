const INDIA_TIMEZONE = 'Asia/Kolkata';

const indiaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: INDIA_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const ATTENDANCE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidAttendanceDate = (value) => {
  if (!ATTENDANCE_DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

const formatAttendanceDateInIndia = (value) => {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return indiaDateFormatter.format(parsed);
};

const normalizeAttendanceDateInput = (value) => {
  if (typeof value === 'string' && isValidAttendanceDate(value.trim())) {
    return value.trim();
  }

  const normalized = formatAttendanceDateInIndia(value);
  if (!normalized || !isValidAttendanceDate(normalized)) {
    return null;
  }

  return normalized;
};

const attendanceDateToUtcDate = (attendanceDate) => {
  if (!isValidAttendanceDate(attendanceDate)) {
    return null;
  }

  return new Date(`${attendanceDate}T00:00:00.000Z`);
};

const getAttendanceDateRange = (attendanceDate) => {
  const start = attendanceDateToUtcDate(attendanceDate);
  if (!start) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

module.exports = {
  INDIA_TIMEZONE,
  isValidAttendanceDate,
  normalizeAttendanceDateInput,
  attendanceDateToUtcDate,
  getAttendanceDateRange,
};

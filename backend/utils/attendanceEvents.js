const EventEmitter = require('events');

const attendanceEvents = new EventEmitter();
attendanceEvents.setMaxListeners(25);

const emitAttendanceEvent = (eventName, payload) => {
  try {
    attendanceEvents.emit(eventName, {
      emittedAt: new Date(),
      ...payload,
    });
  } catch (_error) {
    // Event hooks must never break the request lifecycle.
  }
};

const registerAttendanceListener = (eventName, listener) => {
  attendanceEvents.on(eventName, listener);
  return () => attendanceEvents.off(eventName, listener);
};

module.exports = {
  attendanceEvents,
  emitAttendanceEvent,
  registerAttendanceListener,
};

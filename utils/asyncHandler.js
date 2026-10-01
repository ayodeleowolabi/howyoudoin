// Express 4 doesn't catch errors thrown in async handlers; this forwards them to the error handler.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

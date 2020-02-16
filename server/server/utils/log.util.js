import winstonInstance from '../config/winston';
/**
 * print info message
 * @param msg
 * @returns {*}
 */
function info(msg) {
  winstonInstance.info(msg);
}

/**
 * print log message
 * @param msg
 * @returns {*}
 */
function log(msg) {
  winstonInstance.log(msg);
}

/**
 * print warn message
 * @param msg
 * @returns {*}
 */
function warn(msg) {
  winstonInstance.warn(msg);
}

/**
 * print error message
 * @param msg
 * @returns {*}
 */
function error(msg) {
  winstonInstance.error(msg);
}

export default {
  log,
  info,
  error,
  warn
}
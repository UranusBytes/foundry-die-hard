/**
 * Prints formatted console msg if string, otherwise dumps object
 * @param data {String | Object} Output to be dumped
 * @param force {Boolean}        Log output even if CONFIG.debug.diehard = false
 */
export function dieHardLog(data, force = false) {
  if (CONFIG.debug.simplefog || force) {
    if (typeof data === 'string') console.log(`DieHard | ${data}`);
    else console.log('DieHard |', data);
  }
}

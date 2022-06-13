export function dieHardLog(data, force = false) {
  if (CONFIG.debug.dieHard || force) {
    if (typeof data === 'string') console.log(`DieHard | ${data}`);
    else console.log('DieHard |', data);
  }
}
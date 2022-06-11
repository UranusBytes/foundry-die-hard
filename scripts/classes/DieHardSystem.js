export class DieHardSystem{
  constructor() {

  }

  init() {

  }

  _dmToGm(message) {
    var dm_ids = [];
    for (let indexA = 0; indexA < game.users.length; indexA++) {
      if (game.users[indexA].value.isGM) {
        dm_ids.push(game.users[indexA].key)
      }
    }
    let whisper_to_dm = ChatMessage.create({
      user: game.user.id,
      whisper: dm_ids,
      blind: true,
      content: message
    })
  }

  _dieHardDebugLog(data, force = false) {
    if (CONFIG.debug.dieHard || force) {
      if (typeof data === 'string') console.log(`DieHard | ${data}`);
      else console.log('DieHard |', data);
    }
  }

  _getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  // function sleep(milliseconds) {
  //   const date = Date.now();
  //   let currentDate = null;
  //   do {
  //     currentDate = Date.now();
  //   } while (currentDate - date < milliseconds);
  // }
  //
  //
  //
  // function get_new_result() {
  //   const minResult = 15;
  //   var newResult = 0;
  //   while (newResult < minResult) {
  //     newResult = getRandomInt(20)
  //   }
  //   return newResult;
  // }

}
import {dieHardLog} from "../lib/helpers.js";

export class DieHardSystem{
  constructor() {
    dieHardLog(false, 'DieHardSystem - constructor');
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


  hookReady() {
    dieHardLog(false, 'System Hook - Ready')
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
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

  /*
    Return an array of all actors
   */
  getActors() {
    dieHardLog(false, 'DieHardSystem - getActors');
    let actors = []
    for (let actorId of game.actors.keys()) {
      let curActor = game.actors.get(actorId);
      if(curActor.data.type === 'character') {
        actors.push({id: actorId, name: curActor.name})
      }
    }
    return actors;
  }

  /*
    Return all actor fudges
   */
  getActorFudges() {
    dieHardLog(false, 'DieHardSystem - getActorFudges')
    let actorFudges = []
    let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors();
    for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
      try {
        let actor = actors[actorIndex];
        let currentActorFudges = game.actors.get(actor.id).getFlag('foundry-die-hard', 'actorFudges')
        if (Array.isArray(currentActorFudges)) {
          actorFudges = actorFudges.concat(currentActorFudges)
        }
      }
      catch (e) {}
    }
    dieHardLog(false, 'DieHardSystem - actorFudges', actorFudges)
    return actorFudges;
  }

  /*
    Return all GM fudges
   */
  getGMFudges() {
    return game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges;
  }

  getAllFudges() {
    return this.getGMFudges().concat(this.getActorFudges())
  }


  /*
    Return true if there are any active fudges (GM or Actor)
   */
  hasActiveFudges() {
    let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors();
    for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
      try {
        let actor = actors[actorIndex];
        let actorFudges = game.actors.get(actor.id).getFlag('foundry-die-hard', 'actorFudges');
        for (let actorFudgeIndex = 0; actorFudgeIndex < actorFudges.length; actorFudgeIndex++) {
          if (actorFudges[actorFudgeIndex].statusActive) {
            // Active fudge
            return true;
          }
        }
      }
      catch (e) {}
    }
    // No active fudges
    return false;
  }

  async refreshActiveFudgesIcon() {
    if (this.hasActiveFudges()) {
      document.getElementById('die-hard-fudge-icon').classList.add("die-hard-fudge-icon-active");
    } else {
      document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-fudge-icon-active");
    }
  }

  /*
    Expected to be overridden by system
   */
  getFudgeWhatOptions() {
    return []
  }

  hookReady() {
    dieHardLog(false, 'System Hook - Ready')
  }

  _getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  // game.settings.get('foundry-die-hard', 'dieHardSettings').system.resetActorFudges()
  resetActorFudges() {
    dieHardLog(false, 'DieHardSystem - resetActorFudges')
    let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors();
    for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
      try {
        let actor = actors[actorIndex];
        game.actors.get(actor.id).setFlag('foundry-die-hard', 'actorFudges', [])
      }
      catch (e) {}
    }
  }

  disableAllFudges() {
    dieHardLog(false, 'DieHardSystem : disableAllFudges')
    let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors();
    for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
      try {
        let actorId = actors[actorIndex].id
        let actorFudges = game.actors.get(actorId).getFlag('foundry-die-hard', 'actorFudges');
        for (let fudgeIndex = 0; fudgeIndex < actorFudges.length; fudgeIndex++) {
          actorFudges[fudgeIndex].statusActive = false;
        }
        game.actors.get(actorId).setFlag('foundry-die-hard', 'actorFudges', actorFudges);
      }
      catch (e) {}
    }
    let gmFudges = game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges;
    for (let fudgeIndex = 0; fudgeIndex < gmFudges.length; fudgeIndex++) {
      gmFudges[fudgeIndex].statusActive = false;
    }
    game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges = gmFudges;

    game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon()
  }

}
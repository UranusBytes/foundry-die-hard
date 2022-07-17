import {dieHardLog} from "../lib/helpers.js";

export class DieHardSystem{
  constructor() {
    dieHardLog(false, 'DieHardSystem - constructor');

    // Generic rolls
    CONFIG.Dice.Roll = Roll;
    // libWrapper.register('foundry-die-hard', 'CONFIG.Dice.Roll.prototype.evaluate', this.wrapRollEvaluate, 'WRAPPER');
  }

  wrapRollEvaluate(wrapped, formula, data) {
    dieHardLog(false, 'DieHardSystem : wrapRollEvaluate');
    // dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - this', this);
    dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - formula', formula);
    dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - data', data);
    // dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - game.users.current.data.name', game.users.current.data.name);

    // Check if user has an active fudge
    // ToDo: Figure this out
    wrapped(formula, data);
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

  /**
    Return an array of all actors (map of id and name), defaulting to ones associated with an active player
   */
  getActors(activeOnly = true, includeFudges = false) {
    dieHardLog(false, 'DieHardSystem : getActors');
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').debug.allActors) {
      activeOnly = false
    }
    let onlineUsers = this.getUsers(activeOnly)
    let actors = []
    for (let actorId of game.actors.keys()) {
      let curActor = game.actors.get(actorId);
      if(curActor.data.type === 'character') {
        if (activeOnly) {
          for (let user of onlineUsers) {
            if (curActor.data.permission[user.id] !== undefined) {
              let newActor = {id: actorId, name: curActor.name}
              if (includeFudges) {
                newActor.fudges = curActor.getFlag('foundry-die-hard', 'fudges')
              }
              actors.push(newActor)
            }
          }
        } else {
          let newActor = {id: actorId, name: curActor.name}
          if (includeFudges) {
            newActor.fudges = curActor.getFlag('foundry-die-hard', 'fudges')
          }
          actors.push(newActor)
        }
      }
    }
    return actors;
  }

  /**
    Return an array of all users (map of id and name), defaulting to ones currently active
   */
  getUsers(activeOnly = true, includeFudges = false, getGM = false, userId = null) {
    dieHardLog(false, 'DieHardSystem : getUsers');
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').debug.allActors) {
      activeOnly = false
    }
    let activeUsers = []
    for (let userId of game.users.keys()) {
      let curUser = game.users.get(userId);
      let curUserType = curUser.isGM;
      if (getGM) {
        curUserType = !curUser.isGM;
      }
      if (activeOnly) {
        if (!(curUserType) && curUser.active) {
          let newUser = {id: userId, name: curUser.name}
          if (includeFudges) {
            newUser.fudges = curUser.getFlag('foundry-die-hard', 'fudges')
          }
          activeUsers.push(newUser)
        }
      } else {
        if (!(curUserType)) {
          let newUser = {id: userId, name: curUser.name}
          if (includeFudges) {
            newUser.fudges = curUser.getFlag('foundry-die-hard', 'fudges')
          }
          activeUsers.push(newUser)
        }
      }
    }
    return activeUsers
  }
  
  /**
    Return an array of all fudges
   */
  getAllFudges() {
    dieHardLog(false, 'DieHardSystem : getAllFudges')
    let fudges = {
      actorFudges: this.getActors(false, true),
      userFudges: this.getUsers(false, true),
      gmFudges: this.getUsers(false, true, true)
    }
    return fudges;
  }

  /*
    Return true if there are any active fudges (GM or Actor)
   */
  hasActiveFudges() {
    dieHardLog(false, 'DieHardSystem : hasActiveFudges')
    let curFudges = this.getAllFudges()
    for (let fudgeType in curFudges) {
      for (let typeObject in curFudges[fudgeType]) {
        try {
          if (curFudges[fudgeType][typeObject].fudges.length > 0) {
            return true;
          }
        } catch (e) {}
      }
    }
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

  /**
    Get an object of all who options
   */
  getFudgeWhoUserOptions() {
    return this.getUsers()
  }

  getFudgeWhoGmOptions() {
    return this.getUsers(true, false, true)
  }

  getFudgeWhoActorOptions() {
    return this.getActors()
  }

  hookReady() {
    dieHardLog(false, 'DieHardSystem : hookReady')
  }

  _getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  // game.settings.get('foundry-die-hard', 'dieHardSettings').system.deleteAllFudges()
  deleteAllFudges() {
    dieHardLog(false, 'DieHardSystem : deleteAllFudges')

    // Actors
    let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors();
    for (let actor in actors) {
      try {
        game.actors.get(actors[actor].id).setFlag('foundry-die-hard', 'fudges', null)
        game.actors.get(actors[actor].id).setFlag('foundry-die-hard', 'activeFudges', null)
        game.actors.get(actors[actor].id).setFlag('foundry-die-hard', 'actorFudges', null)
      }
      catch (e) {}
    }

    // Players
    let users = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getUsers(false);
    for (let user in users) {
      try {
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'fudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'activeFudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'userFudges', null)
      }
      catch (e) {}
    }


    // Players
    let gms = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getUsers(false, false, true);
    for (let user in gms) {
      try {
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'fudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'activeFudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'userFudges', null)
      }
      catch (e) {}
    }

  }
  //
  // disableAllFudges() {
  //   dieHardLog(false, 'DieHardSystem : disableAllFudges')
  //   let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors();
  //   for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
  //     try {
  //       let actorId = actors[actorIndex].id
  //       let actorFudges = game.actors.get(actorId).getFlag('foundry-die-hard', 'fudges');
  //       for (let fudgeIndex = 0; fudgeIndex < actorFudges.length; fudgeIndex++) {
  //         actorFudges[fudgeIndex].statusActive = false;
  //       }
  //       game.actors.get(actorId).setFlag('foundry-die-hard', 'fudges', actorFudges);
  //     }
  //     catch (e) {}
  //   }
  //   let gmFudges = game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges;
  //   for (let fudgeIndex = 0; fudgeIndex < gmFudges.length; fudgeIndex++) {
  //     gmFudges[fudgeIndex].statusActive = false;
  //   }
  //   game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges = gmFudges;
  //
  //   game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon()
  // }

  static registerTests = context => {
    dieHardLog(false, 'DieHardSystem : registerTests')
  }
}
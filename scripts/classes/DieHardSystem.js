import {dieHardLog} from "../lib/helpers.js";
import DieHardFudgeRoll from "./DieHardFudgeRoll.js";
import DieHardFudgeD20Roll from "./DieHardFudgeD20Roll.js";

export default class DieHardSystem{
  constructor() {
    dieHardLog(false, 'DieHardSystem - constructor');

    // Generic rolls
    CONFIG.Dice.Roll = Roll;
    libWrapper.register('foundry-die-hard', 'CONFIG.Dice.Roll.prototype.evaluate', this.wrapRollEvaluate, 'WRAPPER');

    CONFIG.Dice.DieHardFudgeRoll = DieHardFudgeRoll;

    this.rawRollClassName = ""
    this.fudgeWhatOptions = []
    this.fudgeWhatBaseOptions = [
      {
        id: 'rawd100',
        name: 'd100'
      },
      {
        id: 'rawd20',
        name: 'd20'
      },
      {
        id: 'rawd12',
        name: 'd12'
      },
      {
        id: 'rawd10',
        name: 'd10'
      },
      {
        id: 'rawd8',
        name: 'd8'
      },
      {
        id: 'rawd6',
        name: 'd6'
      },
      {
        id: 'rawd4',
        name: 'd4'
      }
    ]
  }

  evalFudge(result, operator, operatorValue) {
    dieHardLog(false, 'DieHardSystem - evalFudge', result, operator, operatorValue);
    switch (operator) {
      case '>':   return result > operatorValue;
      case '<':   return result < operatorValue;
      case '>=':  return result >= operatorValue;
      case '<=':  return result <= operatorValue;
      case '!=':  return result !== operatorValue;
      case '=': return result === operatorValue;
    }
  }

  isBetterFudge(oldTotal, newTotal, operator, operatorValue) {
    dieHardLog(false, 'DieHardSystem - isBetterFudge', oldTotal, newTotal, operator, operatorValue);
    switch (operator) {
      case '>':
        return newTotal > oldTotal;
      case '<':
        return newTotal < oldTotal;
      case '>=':
        return newTotal >= oldTotal;
      case '<=':
        return newTotal <= oldTotal;
      case '!=':
        return false;
      case '=':
        return false;
    }
  }

  wrapRollEvaluate(wrapped, eval_options) {
    dieHardLog(false, 'DieHardSystem : wrapRollEvaluate');
    dieHardLog(false, 'DieHardSystem - wrapRollEvaluate - arguments', arguments);
    dieHardLog(false, 'DieHardSystem - wrapRollEvaluate - this', this);
    dieHardLog(false, 'DieHardSystem - wrapRollEvaluate - this.callee', this.callee);

    // dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - this.constructor.name', this.constructor.name);
    dieHardLog(false, 'DieHardSystem - wrapRollEvaluate - eval_options', eval_options);
    //dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - game.users.current.data.name', game.users.current.data.name);
    dieHardLog(true, 'DieHardSystem - wrapRollEvaluate - this.constructor.name', this.constructor.name);

    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable) {
      dieHardLog(true, 'DieHardSystem - wrapRollEvaluate - Globally disabled', game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable);
      // Globally disabled
      return wrapped(eval_options)
    }

    // Check if a raw die roll (otherwise some type of system specific raw)
    if (this.constructor.name === game.settings.get('foundry-die-hard', 'dieHardSettings').system.rawRollClassName){
      dieHardLog(false, 'DieHardSystem - wrapRollEvaluate - raw roll; figure out if needs to be fudged or is a recursive fudge');

      let fudge = false;
      for (let die in this.dice) {
        if (typeof this.dice[die] === 'function') {
          dieHardLog(false, 'DieHardSystem - wrapRollEvaluate - die is function; ignore');
          continue;
        }
        // dieHardLog(false, 'DieHardDnd5e - wrapRollEvaluate - die', this.dice[die]);

        // Check if actor has an active raw fudge
        // ToDo: something goes here...

        // Check if user has an active raw fudge
        let userFudges = game.users.current.getFlag('foundry-die-hard', 'fudges');
        if (! Array.isArray(userFudges)) {
          userFudges = []
        }
        // dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - userFudges', userFudges);
        dieHardLog(false, 'DieHardSystem.wrappedRoll - raw die faces', this.dice[die].faces);
        let fudgeIndex = userFudges.findIndex(element => { return element.whatId === ('rawd' + this.dice[die].faces);});
        if (fudgeIndex !== -1 && userFudges[fudgeIndex].statusActive) {
          dieHardLog(false, 'DieHardSystem.wrappedRoll - active user raw fudge', userFudges[fudgeIndex]);
          foundry.utils.mergeObject(this, {data: {fudge: true, fudgeOperator: userFudges[fudgeIndex].operator, fudgeOperatorValue: userFudges[fudgeIndex].operatorValue, fudgeHow: userFudges[fudgeIndex].howFormula }});

          if (userFudges[fudgeIndex].statusEndless) {
            dieHardLog(false, 'DieHardSystem.wrappedRoll - fudge is endless');
          } else {
            // Disable the fudge
            userFudges[fudgeIndex].statusActive = false

            // Delete the fudge from the user
            // let deletedFudge = userFudges.splice(fudgeIndex,1)
            game.users.current.setFlag('foundry-die-hard', 'fudges', userFudges);
            // Check if still have active fudges;
            game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon()
          }
          // This is a root roll, so allow fudge re-roll
          fudge = true;
          // Stop looking for more opportunities to fudge
          break
        }
      }
      let result = null
      if (fudge) {
        result = wrapped({minimize: eval_options.minimize, maximize: eval_options.maximize, async: false})
        dieHardLog(false, 'DieHardSystem.wrappedRoll - roll can be fudged');
        if (this instanceof CONFIG.Dice.DieHardFudgeRoll) {
          dieHardLog(false, 'DieHardSystem.wrappedRoll - recursive roll', this);
        } else {
          dieHardLog(false, 'DieHardSystem.wrappedRoll - base roll', this);
          dieHardLog(false, 'DieHardSystem.wrappedRoll - result', result);
          let gen_new_result = false;
          let evalResult = game.settings.get('foundry-die-hard', 'dieHardSettings').system.evalFudge(this.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)

          if (evalResult) {
            dieHardLog(false, 'DieHardSystem - wrapRollEvaluate: Fudge not needed, but still wiped');
            game.settings.get('foundry-die-hard', 'dieHardSettings').system.dmToGm('DieHard-Fudge: Fudge not needed, but still wiped...');
          } else {
            gen_new_result = true;
            dieHardLog(false, 'DieHardSystem - wrapRollEvaluate: Start fudging');
            let dmMessage = "Fudge (" + result.data.fudgeHow + ") values:" + result.total;
            let SafetyLoopIndex = game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
            while (gen_new_result && SafetyLoopIndex > 0) {
              SafetyLoopIndex--;
              let new_roll = new DieHardFudgeRoll(this._formula, this.data, this.options)
              new_roll.evaluate({async:false})
              evalResult = game.settings.get('foundry-die-hard', 'dieHardSettings').system.evalFudge(new_roll.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)
              if (evalResult) {
                dieHardLog(false, 'DieHardSystem - wrapRollEvaluate: New result: ' + new_roll.total)
                gen_new_result = false;
                foundry.utils.mergeObject(this, new_roll);
                game.settings.get('foundry-die-hard', 'dieHardSettings').system.dmToGm(dmMessage);
              } else {
                // New roll is insufficient, but lets at least check if it is "closer"
                if (game.settings.get('foundry-die-hard', 'dieHardSettings').system.isBetterFudge(this.total, new_roll.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)) {
                  dieHardLog(false, 'DieHardSystem - wrapRollEvaluate: New result insufficient, but at least better (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
                  foundry.utils.mergeObject(this, new_roll);
                } else {
                  dieHardLog(false, 'DieHardSystem - wrapRollEvaluate: New result insufficient (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
                }
                dmMessage += ',' + new_roll.total;
              }
            }
            if (SafetyLoopIndex === 0) {
              dieHardLog(false, 'DieHardSystem - wrapRollEvaluate: Tried until retry safety killed...');
              game.settings.get('foundry-die-hard', 'dieHardSettings').system.dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
            }
          }
        }

      } else {
        result = wrapped(eval_options)
      }
      return result
      /*
      // Check if actor has an active fudge
      let actorFudges = game.actors.get(actorId).getFlag('foundry-die-hard', 'fudges');
      if (! Array.isArray(actorFudges)) {
        actorFudges = []
      }
      //dieHardLog(false, 'DieHardDnd5e.wrappedRoll - actorFudges', actorFudges);
      let fudgeIndex = actorFudges.findIndex(element => { return element.whatId === rollType;});
      if (fudgeIndex !== -1 && actorFudges[fudgeIndex].statusActive) {
        dieHardLog(false, 'DieHardDnd5e.wrappedRoll - active actor fudge', actorFudges[fudgeIndex]);
        foundry.utils.mergeObject(options, {data: {fudge: true, fudgeOperator: actorFudges[fudgeIndex].operator, fudgeOperatorValue: actorFudges[fudgeIndex].operatorValue, fudgeHow: actorFudges[fudgeIndex].howFormula }});
        // Delete the fudge from the actor
        let deletedFudge = actorFudges.splice(fudgeIndex,1)
        game.actors.get(actorId).setFlag('foundry-die-hard', 'fudges', actorFudges);
        // Check if still have active fudges;
        this.refreshActiveFudgesIcon();
      }
       */
    } else {
      // Only this works!  let result = wrapped(eval_options)  return result
      // let result = wrapped(eval_options)
      return wrapped(eval_options)
    }
  }

  dmToGm(message) {
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
    dieHardLog(false, 'DieHardSystem : getUsers', activeOnly, includeFudges, getGM, userId);
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
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable) {
      document.getElementById('die-hard-pause-fudge-icon').classList.remove("die-hard-fudge-pause-icon-hidden");
      document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-fudge-icon-active");
      return;
    } else {
      document.getElementById('die-hard-pause-fudge-icon').classList.add("die-hard-fudge-pause-icon-hidden");
    }
    if (this.hasActiveFudges()) {
      document.getElementById('die-hard-fudge-icon').classList.add("die-hard-fudge-icon-active");
    } else {
      document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-fudge-icon-active");
    }
  }

  getFudgeWhatOptions() {
    return this.fudgeWhatOptions;
  }

  getFudgeWhatBaseOptions() {
    return this.fudgeWhatBaseOptions;
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

  disableAllFudges() {
    dieHardLog(false, 'DieHardSystem : disableAllFudges', game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable)
    game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable = ! game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon();
  }

  static registerTests = context => {
    dieHardLog(false, 'DieHardSystem : registerTests')
  }
}
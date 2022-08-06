import {dieHardLog} from "../lib/helpers.js";
import DieHardFudgeRoll from "./DieHardFudgeRoll.js";
import DieHard, {DieHardSetting} from "./DieHard.js";

export default class DieHardSystem{
  constructor() {
    dieHardLog(false, 'DieHardSystem.constructor');

    // Generic rolls
    CONFIG.Dice.Roll = Roll;
    CONFIG.Dice.DieHardFudgeRoll = DieHardFudgeRoll;

    this.totalRollClassName = []
    this.fudgeWhatOptions = []
    this.fudgeWhatRawOptions = [
      {
        id: 'rawd100',
        name: 'Raw d100'
      },
      {
        id: 'rawd20',
        name: 'Raw d20'
      },
      {
        id: 'rawd12',
        name: 'Raw d12'
      },
      {
        id: 'rawd10',
        name: 'Raw d10'
      },
      {
        id: 'rawd8',
        name: 'Raw d8'
      },
      {
        id: 'rawd6',
        name: 'Raw d6'
      },
      {
        id: 'rawd4',
        name: 'Raw d4'
      }
    ]
    this.fudgeWhatTotalOptions = [
      {
        id: 'totald100',
        name: 'Total d100'
      },
      {
        id: 'totald20',
        name: 'Total d20'
      },
      {
        id: 'totald12',
        name: 'Total d12'
      },
      {
        id: 'totald10',
        name: 'Total d10'
      },
      {
        id: 'totald8',
        name: 'Total d8'
      },
      {
        id: 'totald6',
        name: 'Total d6'
      },
      {
        id: 'totald4',
        name: 'Total d4'
      }
    ]    
  }

  registerBaseLibWraps() {
    dieHardLog(false, 'DieHardSystem.registerBaseLibWraps');
    libWrapper.register('foundry-die-hard', 'CONFIG.Dice.Roll.prototype.evaluate', this.wrapRollEvaluate, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Dice.termTypes.DiceTerm.prototype.roll', this.wrapDiceTermRoll, 'MIXED');
  }

  unregisterBaseLibWraps() {
    dieHardLog(false, 'DieHardSystem.unregisterBaseLibWraps');
    libWrapper.unregister('foundry-die-hard', 'CONFIG.Dice.Roll.prototype.evaluate', this.wrapRollEvaluate, 'WRAPPER');
    libWrapper.unregister('foundry-die-hard', 'CONFIG.Dice.termTypes.DiceTerm.prototype.roll', this.wrapDiceTermRoll, 'MIXED');
  }

  evalFudge(result, operator, operatorValue) {
    dieHardLog(false, 'DieHardSystem.evalFudge', result, operator, operatorValue);
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
    dieHardLog(false, 'DieHardSystem.isBetterFudge', oldTotal, newTotal, operator, operatorValue);
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

  wrapDiceTermRoll(wrapped, eval_options) {
    let functionLogName = 'DieHardSystem.wrapDiceTermRoll'
    //dieHardLog(false, functionLogName);
    //dieHardLog(false, functionLogName + ' - this', this);
    //dieHardLog(false, functionLogName + ' - eval_options', eval_options);

    if (DieHardSetting('dieHardSettings').fudgeConfig.globalDisable) {
      dieHardLog(true, functionLogName + ' - Globally disabled', DieHardSetting('dieHardSettings').fudgeConfig.globalDisable);
      // Globally disabled
      return wrapped(eval_options)
    }

    // Check if user has an active raw fudge
    let userFudges = game.users.current.getFlag('foundry-die-hard', 'fudges');
    if (! Array.isArray(userFudges)) {
      userFudges = []
    }
    let fudgeIndex = userFudges.findIndex(element => { return ((element.whatId === ('rawd' + this.faces)) && (element.statusActive));});
    if (fudgeIndex !== -1) {
      dieHardLog(false, functionLogName + ' - active user raw fudge', userFudges[fudgeIndex]);

      // Time to make the fudge
      let gen_new_result = true;
      let failedRolls = [];
      let SafetyLoopIndex = DieHardSetting('dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
      let newResult = undefined
      let roll = {result: undefined, active: true};
      while (gen_new_result && SafetyLoopIndex > 0) {
        SafetyLoopIndex--;

        // This is copied from resources/app/client/dice/terms/dice.js - rolls method
        if ( eval_options.minimize ) roll.result = Math.min(1, this.faces);
        else if ( eval_options.maximize ) newResult = this.faces;
        else newResult = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);

        let evalResult = DieHardSetting('dieHardSettings').system.evalFudge(newResult, userFudges[fudgeIndex].operator, userFudges[fudgeIndex].operatorValue)
        if (evalResult) {
          dieHardLog(false, functionLogName + ' - New result: ' + newResult)
          gen_new_result = false;
          roll.result = newResult
          this.results.push(roll);
          DieHard.dmToGm("Raw Fudge (" + userFudges[fudgeIndex].howFormula + ") values: " + failedRolls.join(', ') + "  Final: " + newResult);
          dieHardLog(false, functionLogName + ' - dmToGm');
        } else {
          // New roll is insufficient, but lets at least check if it is "closer"
          if (DieHardSetting('dieHardSettings').system.isBetterFudge(roll.result, newResult, userFudges[fudgeIndex].operator, userFudges[fudgeIndex].operatorValue)) {
            dieHardLog(false, functionLogName + ' - New result insufficient, but at least better (' + newResult + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
            roll.result = newResult
          } else {
            dieHardLog(false, functionLogName + ' - New result insufficient (' + newResult + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
          }
          failedRolls.push(newResult);
        }
      }

      if (userFudges[fudgeIndex].statusEndless) {
        dieHardLog(false, functionLogName + ' - fudge is endless');
      } else {
        // Disable the fudge
        userFudges[fudgeIndex].statusActive = false

        // Delete the fudge from the user
        let deletedFudge = userFudges.splice(fudgeIndex,1)
        game.users.current.setFlag('foundry-die-hard', 'fudges', userFudges);

        DieHard.refreshDieHardIcons()
      }
      return roll
    } else {
      // No fudging to occur; let the normal roll occur
      return wrapped(eval_options)
    }
  }

  makeId(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
     }
     return result;
  }

  wrapRollEvaluate(wrapped, eval_options) {
    var uuid = game.settings.get('foundry-die-hard', 'dieHardSettings').system.makeId(6)
    let functionLogName = 'DieHardSystem.wrapRollEvaluate-' + uuid
    dieHardLog(false, functionLogName);
    dieHardLog(false, functionLogName + ' - arguments', arguments);
    dieHardLog(false, functionLogName + ' - this', this);

    // This is Better Rolls 5e; ignore
    if (this._formula === '0' || isObjectEmpty(this.options)) {
      // dieHardLog(false, functionLogName + ' - Better Rolls 5e - skip fudge');
      // return wrapped(eval_options)
      dieHardLog(false, functionLogName + ' - Better Rolls 5e - Ignore initial roll');

    } else {
      //dieHardLog(false, functionLogName + ' - NOT Better Rolls 5e - ', this._formula);
      //dieHardLog(false, functionLogName + ' - NOT Better Rolls 5e - ', this.options);
      //dieHardLog(false, functionLogName + ' - NOT Better Rolls 5e - ', isObjectEmpty(this.options));
      dieHardLog(false, functionLogName + ' - Better Rolls 5e - only fudge the second roll');
      return wrapped(eval_options)
    }

    // dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - this.constructor.name', this.constructor.name);
    dieHardLog(false, functionLogName + ' - eval_options', eval_options);
    //dieHardLog(true, 'DieHardDnd5e - wrapRollEvaluate - game.users.current.data.name', game.users.current.data.name);
    dieHardLog(true, functionLogName + ' - this.constructor.name', this.constructor.name);

    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable) {
      dieHardLog(true, functionLogName + ' - Globally disabled', game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable);
      // Globally disabled
      return wrapped(eval_options)
    }

    // Check if a total die roll (otherwise some type of system specific roll)
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').system.totalRollClassName.indexOf(this.constructor.name) !== -1){
      dieHardLog(false, functionLogName + ' - total roll; figure out if needs to be fudged or is a recursive fudge');

      let fudge = false;
      for (let die in this.dice) {
        if (typeof this.dice[die] === 'function') {
          dieHardLog(false, functionLogName + ' - die is function; ignore');
          continue;
        }

        dieHardLog(false, functionLogName + ' - DEBUG POINT');
        // Check if actor has an active total fudge
        // ToDo: something goes here...  #6
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

        // Check if user has an active total fudge
        let userFudges = game.users.current.getFlag('foundry-die-hard', 'fudges');
        if (! Array.isArray(userFudges)) {
          userFudges = []
        }

        let fudgeIndex = userFudges.findIndex(element => { return ((element.whatId === ('totald' + this.dice[die].faces)) && (element.statusActive));});
        dieHardLog(false, functionLogName + ' - dice faces', this.dice[die].faces);
        if (fudgeIndex !== -1) {
          dieHardLog(false, functionLogName + ' - active user total fudge', userFudges[fudgeIndex]);
          foundry.utils.mergeObject(this, {data: {fudge: true, fudgeOperator: userFudges[fudgeIndex].operator, fudgeOperatorValue: userFudges[fudgeIndex].operatorValue, fudgeHow: userFudges[fudgeIndex].howFormula }});

          if (userFudges[fudgeIndex].statusEndless) {
            dieHardLog(false, functionLogName + ' - fudge is endless');
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
        dieHardLog(false, functionLogName + ' - roll can be fudged');
        if (this instanceof CONFIG.Dice.DieHardFudgeRoll) {
          dieHardLog(false, functionLogName + 'e - recursive roll', this);
        } else {
          dieHardLog(false, functionLogName + ' - base roll', this);
          dieHardLog(false, functionLogName + ' - result', result);
          let gen_new_result = false;
          let evalResult = game.settings.get('foundry-die-hard', 'dieHardSettings').system.evalFudge(this.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)

          if (evalResult) {
            dieHardLog(false, functionLogName + ' - Fudge not needed, but still wiped');
            DieHard.dmToGm('DieHard-Fudge: Total Fudge not needed, but still wiped...');
            dieHardLog(false, functionLogName + ' - dmToGm');

          } else {
            gen_new_result = true;
            dieHardLog(false, functionLogName + ' - Start fudging');
            let dmMessage = "Total Fudge (" + result.data.fudgeHow + ") values:" + result.total;
            let SafetyLoopIndex = game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
            while (gen_new_result && SafetyLoopIndex > 0) {
              SafetyLoopIndex--;
              let new_roll = new DieHardFudgeRoll(this._formula, this.data, this.options)
              new_roll.evaluate({async:false})
              evalResult = game.settings.get('foundry-die-hard', 'dieHardSettings').system.evalFudge(new_roll.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)
              if (evalResult) {
                dieHardLog(false, functionLogName + ' - New result: ' + new_roll.total)
                gen_new_result = false;
                foundry.utils.mergeObject(this, new_roll);
                DieHard.dmToGm(dmMessage + '  Total Final: ' + new_roll.total);
                dieHardLog(false, functionLogName + ' - dmToGm');
              } else {
                // New roll is insufficient, but lets at least check if it is "closer"
                if (game.settings.get('foundry-die-hard', 'dieHardSettings').system.isBetterFudge(this.total, new_roll.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)) {
                  dieHardLog(false, functionLogName + ' - New result insufficient, but at least better (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
                  foundry.utils.mergeObject(this, new_roll);
                } else {
                  dieHardLog(false, functionLogName + ' - New result insufficient (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
                }
                dmMessage += ',' + new_roll.total;
              }
            }
            if (SafetyLoopIndex === 0) {
              dieHardLog(false, functionLogName + ' - Tried until retry safety killed...');
              DieHard.dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
            }
          }
        }

      } else {
        result = wrapped(eval_options)
      }
      return result
    } else {
      // Only this works!  let result = wrapped(eval_options)  return result
      // let result = wrapped(eval_options)
      return wrapped(eval_options)
    }
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
    /*
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable) {
      document.getElementById('die-hard-pause-fudge-icon').classList.remove("die-hard-icon-hidden");
      //document.getElementById('die-hard-fudge-icon').classList.add("die-hard-icon-hidden");
      return;
    } else {
      document.getElementById('die-hard-pause-fudge-icon').classList.add("die-hard-icon-hidden");
      //document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-icon-hidden");
    }

     */

    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable) {
      document.getElementById('die-hard-pause-fudge-icon').classList.remove("die-hard-icon-hidden");
      document.getElementById('die-hard-fudge-icon').classList.add("die-hard-icon-hidden");
      return;
    } else {
      document.getElementById('die-hard-pause-fudge-icon').classList.add("die-hard-icon-hidden");
      document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-icon-hidden");
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

  getFudgeWhatRawOptions() {
    return this.fudgeWhatRawOptions;
  }

  getFudgeWhatTotalOptions() {
    return this.fudgeWhatTotalOptions;
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
    DieHardSetting('dieHardSettings').fudgeConfig.globalDisable = ! game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable
    DieHard.refreshDieHardIcons();
  }

  static registerTests = context => {
    dieHardLog(false, 'DieHardSystem : registerTests')
  }
}
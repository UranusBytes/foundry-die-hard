import {dieHardLog, makeId} from "../lib/helpers.js";
import DieHardFudgeRoll from "./DieHardFudgeRoll.js";
import DieHard, {DieHardSetting} from "./DieHard.js";

export default class DieHardSystem {
  constructor() {
    dieHardLog(false, 'DieHardSystem.constructor');

    // Total rolls
    CONFIG.Dice.Roll = Roll;
    libWrapper.register('foundry-die-hard', 'CONFIG.Dice.Roll.prototype.evaluate', this.wrapRollEvaluate, 'WRAPPER');

    // Raw rolls
    libWrapper.register('foundry-die-hard', 'CONFIG.Dice.termTypes.DiceTerm.prototype.roll', this.wrapDiceTermRoll, 'MIXED');

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

  evalFudge(result, operator, operatorValue) {
    dieHardLog(false, 'DieHardSystem.evalFudge', result, operator, operatorValue);
    switch (operator) {
      case '>':
        return result > operatorValue;
      case '<':
        return result < operatorValue;
      case '>=':
        return result >= operatorValue;
      case '<=':
        return result <= operatorValue;
      case '!=':
        return result !== operatorValue;
      case '=':
        return result === operatorValue;
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

  getUserFudge(fudgeType) {
    dieHardLog(false, 'DieHardSystem.getUserFudge');
    let userFudges = game.users.current.getFlag('foundry-die-hard', 'fudges');
    dieHardLog(false, 'DieHardSystem.getUserFudge - userFudges', userFudges);
    if (!Array.isArray(userFudges)) {
      return null
    }
    let fudgeIndex = userFudges.findIndex(element => {
      return ((element.whatId === fudgeType) && (element.statusActive));
    });
    dieHardLog(false, 'DieHardSystem.getUserFudge - fudgeIndex', fudgeIndex);
    if (fudgeIndex !== -1) {
      return userFudges[fudgeIndex]
    } else {
      return null
    }
  }

  disableUserFudge(fudgeId) {
    dieHardLog(false, 'DieHardSystem.disableUserFudge');
    let userFudges = game.users.current.getFlag('foundry-die-hard', 'fudges');
    let fudgeIndex = userFudges.findIndex(element => {
      return (element.id === fudgeId);
    });
    userFudges[fudgeIndex].statusActive = false
    game.users.current.setFlag('foundry-die-hard', 'fudges', userFudges);
    DieHard.refreshDieHardIcons()
  }

  /**
   * Wrapper for raw dice
   * @param wrapped
   * @param eval_options
   * @returns {{result: undefined, active: boolean}|*}
   */
  wrapDiceTermRoll(wrapped, eval_options) {
    let functionLogName = 'DieHardSystem.wrapDiceTermRoll'
    dieHardLog(false, functionLogName);

    if (! DieHardSetting('fudgeEnabled') ) {
      dieHardLog(true, functionLogName + ' - Fudge disabled');
    } else if (DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      dieHardLog(true, functionLogName + ' - Fudging Globally disabled');
    } else {
      // Check if user has an active raw fudge
      let userFudge = game.dieHardSystem.getUserFudge('rawd' + this.faces)
      dieHardLog(true, functionLogName + ' - userFudge', userFudge);
      if (userFudge !== null) {
        dieHardLog(false, functionLogName + ' - active user raw fudge', userFudge);

        // Time to make the fudge
        let gen_new_result = true;
        let failedRolls = [];
        let SafetyLoopIndex = DieHardSetting('dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
        let newResult = undefined
        let roll = {result: undefined, active: true};
        while (gen_new_result && SafetyLoopIndex > 0) {
          SafetyLoopIndex--;

          // ToDo: remove this hack
          // Only force the roll on the first die
          if (DieHardSetting('debugDieResultEnabled') && newResult === undefined) {
            newResult = DieHardSetting('debugDieResult')
            dieHardLog(true, functionLogName + ' - debugDieResult used', newResult);
          } else {
            // This is copied from resources/app/client/dice/terms/dice.js - rolls method
            if (eval_options.minimize) roll.result = Math.min(1, this.faces);
            else if (eval_options.maximize) newResult = this.faces;
            else newResult = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);
          }

          let evalResult = game.dieHardSystem.evalFudge(newResult, userFudge.operator, userFudge.operatorValue)
          if (evalResult) {
            dieHardLog(false, functionLogName + ' - New result: ' + this.total)
            gen_new_result = false;
            roll.result = newResult
            this.results.push(roll);
            if (failedRolls.length === 0) {
              DieHard.dmToGm('DieHard-Fudge: Total Fudge not needed (' + newResult + ' ' + userFudge.howFormula + ')');
            } else {
              DieHard.dmToGm('DieHard-Fudge: Raw Fudge (' + userFudge.howFormula + ') values: ' + failedRolls.join(', ') + '  Final: ' + newResult);
            }
          } else {
            // New roll is insufficient, but lets at least check if it is "closer"
            if (game.dieHardSystem.isBetterFudge(roll.result, newResult, userFudge.operator, userFudge.operatorValue)) {
              dieHardLog(false, functionLogName + ' - New result (' + newResult + ') insufficient (' + userFudge.fudgeOperator + ' ' + userFudge.fudgeOperatorValue + '), but at least better.  Try again (tries left: ' + SafetyLoopIndex + ')...')
              roll.result = newResult
            } else {
              dieHardLog(false, functionLogName + ' - New result (' + newResult + ') insufficient (' + userFudge.fudgeOperator + ' ' + userFudge.fudgeOperatorValue + ').  Try again (tries left: ' + SafetyLoopIndex + ')...')
            }
            failedRolls.push(newResult);
          }
        }
        if (SafetyLoopIndex === 0) {
                dieHardLog(false, functionLogName + ' - Tried until retry safety killed...');
                DieHard.dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
              }
        if (userFudge.statusEndless) {
          dieHardLog(false, functionLogName + ' - fudge is endless');
        } else {
          game.dieHardSystem.disableUserFudge(userFudge.id)
        }
        // Return the fudged roll; no taking karma into consideration
        return roll
      }
      // No user fudging to occur; continue roll as usual
    }

    if (! DieHardSetting('karmaEnabled') ) {
      dieHardLog(true, functionLogName + ' - Karma disabled');
    } else if (this.faces !== 20) {
      dieHardLog(true, functionLogName + ' - Karma enabled, but wrong die type', this.faces);
    } else {
      let simpleKarmaSettings = DieHardSetting('simpleKarmaSettings')
      if (simpleKarmaSettings.enabled) {
        dieHardLog(true, functionLogName + ' - Simple Karma', this);
        let simpleKarmaData = game.users.current.getFlag('foundry-die-hard', 'simpleKarma')
        if (!Array.isArray(simpleKarmaData)) {
          simpleKarmaData = []
        }

        let newResult = undefined
        let roll = {result: undefined, active: true};

        // This is copied from resources/app/client/dice/terms/dice.js - rolls method
        if (eval_options.minimize) roll.result = Math.min(1, this.faces);
        else if (eval_options.maximize) newResult = this.faces;
        else newResult = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);

        // ToDo: remove this hack
        if (DieHardSetting('debugDieResultEnabled')) {
          newResult = DieHardSetting('debugDieResult')
          dieHardLog(true, functionLogName + ' - debugDieResult used', newResult);
        }

        roll.result = newResult
        simpleKarmaData.push(newResult)

        while (simpleKarmaData.length > simpleKarmaSettings.history) {
          simpleKarmaData.shift()
        }
        dieHardLog(true, functionLogName + ' - Simple Karma Data', simpleKarmaData);
        let tempResult = simpleKarmaData.findIndex(element => {return element > simpleKarmaSettings.threshold})
        dieHardLog(true, functionLogName + ' - Simple Karma tempResult', tempResult);
        if (simpleKarmaData.length === simpleKarmaSettings.history && tempResult === -1) {
          dieHardLog(true, functionLogName + ' - Simple Karma adjustment needed', newResult);
          let originalResult = newResult
          while (newResult < simpleKarmaSettings.floor) {
            // This is copied from resources/app/client/dice/terms/dice.js - rolls method
            if (eval_options.minimize) roll.result = Math.min(1, this.faces);
            else if (eval_options.maximize) newResult = this.faces;
            else newResult = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);
            roll.result = newResult
            dieHardLog(true, functionLogName + ' - Simple Karma adjustment - new result', newResult);
          }

          simpleKarmaData.push(newResult)
          while (simpleKarmaData.length > simpleKarmaSettings.history) {
            simpleKarmaData.shift()
          }
          DieHard.dmToGm('DieHard-Karma: Simple Karma for ' + game.users.current.name + ' adjusted a roll of ' + originalResult + ' to a ' + newResult);
        }

        game.users.current.setFlag('foundry-die-hard', 'simpleKarma', simpleKarmaData)
        this.results.push(roll);
        return roll
      } else {
        dieHardLog(true, functionLogName + ' - Simple Karma disabled');
      }

      let avgKarmaSettings = DieHardSetting('avgKarmaSettings')
      if (avgKarmaSettings.enabled) {
        dieHardLog(true, functionLogName + ' - Avg Karma', this);
        let avgKarmaData = game.users.current.getFlag('foundry-die-hard', 'avgKarma')
        if (!Array.isArray(avgKarmaData)) {
          avgKarmaData = []
        }

        let newResult = undefined
        let roll = {result: undefined, active: true};

        // This is copied from resources/app/client/dice/terms/dice.js - rolls method
        if (eval_options.minimize) roll.result = Math.min(1, this.faces);
        else if (eval_options.maximize) newResult = this.faces;
        else newResult = Math.ceil(CONFIG.Dice.randomUniform() * this.faces);

        // ToDo: remove this hack
        if (DieHardSetting('debugDieResultEnabled')) {
          newResult = DieHardSetting('debugDieResult')
          dieHardLog(true, functionLogName + ' - debugDieResult used', newResult);
        }

        roll.result = newResult
        avgKarmaData.push(newResult)

        while (avgKarmaData.length > avgKarmaSettings.history) {
          avgKarmaData.shift()
        }
        dieHardLog(true, functionLogName + ' - Avg Karma Data', avgKarmaData);
        let tempResult = avgKarmaData.reduce((a, b) => a + b, 0) / avgKarmaData.length;
        dieHardLog(true, functionLogName + ' - Avg Karma tempResult', tempResult);
        if (avgKarmaData.length === avgKarmaSettings.history && tempResult <= avgKarmaSettings.threshold) {
          dieHardLog(true, functionLogName + ' - Avg Karma adjustment needed', newResult);
          let originalResult = newResult
          newResult += avgKarmaSettings.nudge

          if (newResult > this.faces) {
            newResult = this.faces
          }
          roll.result = newResult
          dieHardLog(true, functionLogName + ' - Avg Karma adjustment - new result', newResult);

          avgKarmaData.push(newResult)
          while (avgKarmaData.length > avgKarmaData.history) {
            avgKarmaData.shift()
          }
          DieHard.dmToGm('DieHard-Karma: Avg Karma for ' + game.users.current.name + ' adjusted a roll of ' + originalResult + ' to a ' + newResult);
        } else {
          dieHardLog(true, functionLogName + ' - Avg Karma adjustment not needed', avgKarmaData.length, avgKarmaSettings.history, avgKarmaSettings.threshold);
        }

        game.users.current.setFlag('foundry-die-hard', 'avgKarma', avgKarmaData)
        this.results.push(roll);
        return roll
      } else {
        dieHardLog(true, functionLogName + ' - avg Karma disabled');
      }


    }
    return wrapped(eval_options)
  }

  /**
   * Wrapper for a total roll
   * @param wrapped
   * @param eval_options
   * @returns {*}
   */
  wrapRollEvaluate(wrapped, eval_options) {
    let uuid = makeId(6)
    let functionLogName = 'DieHardSystem.wrapRollEvaluate-' + uuid
    dieHardLog(false, functionLogName, this, eval_options);

    if (! DieHardSetting('fudgeEnabled') ) {
      dieHardLog(true, functionLogName + ' - Fudge disabled');
    } else if (DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      dieHardLog(true, functionLogName + ' - Fudging Globally disabled');
    } else {
      // Check if a total die roll (otherwise some type of system specific roll)
      if (game.dieHardSystem.totalRollClassName.indexOf(this.constructor.name) !== -1) {
        dieHardLog(false, functionLogName + ' - total roll; figure out if needs to be fudged or is a recursive fudge');

        for (let die in this.dice) {
          if (typeof this.dice[die] === 'function') {
            dieHardLog(false, functionLogName + ' - die is function; ignore');
            continue;
          }

          dieHardLog(false, functionLogName + ' - dice faces', this.dice[die].faces);
          let userFudge = game.dieHardSystem.getUserFudge('totald' + this.dice[die].faces)
          if (userFudge !== null) {
            dieHardLog(false, functionLogName + ' - active user total fudge', userFudge);
            foundry.utils.mergeObject(this, {
              data: {
                fudge: true,
                fudgeOperator: userFudge.operator,
                fudgeOperatorValue: userFudge.operatorValue,
                fudgeHow: userFudge.howFormula
              }
            });

            if (userFudge.statusEndless) {
              dieHardLog(false, functionLogName + ' - fudge is endless');
            } else {
              game.dieHardSystem.disableUserFudge(userFudge.id)
            }
            // This is a root roll, so allow fudge re-roll
            // Stop looking for more opportunities to fudge
            break
          }
        }
        let result = null
        if (this.data.fudge !== undefined) {
          result = wrapped({minimize: eval_options.minimize, maximize: eval_options.maximize, async: false})
          dieHardLog(false, functionLogName + ' - roll can be fudged');
          if (this instanceof CONFIG.Dice.DieHardFudgeRoll) {
            dieHardLog(false, functionLogName + 'e - recursive roll', this);
          } else {
            dieHardLog(false, functionLogName + ' - base roll', this, result);
            let gen_new_result = false;
            let evalResult = game.dieHardSystem.evalFudge(this.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)

            if (evalResult) {
              dieHardLog(false, functionLogName + ' - Fudge not needed (' + this.total + ' ' + this.data.fudgeOperator + ' ' + this.data.fudgeOperatorValue + ')');
              DieHard.dmToGm('DieHard-Fudge: Total Fudge not needed (' + this.total + ' ' + this.data.fudgeOperator + ' ' + this.data.fudgeOperatorValue + ')');
              dieHardLog(false, functionLogName + ' - dmToGm');

            } else {
              let failedRolls = [this.total];
              gen_new_result = true;
              dieHardLog(false, functionLogName + ' - Start fudging');
              let SafetyLoopIndex = DieHardSetting('dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
              while (gen_new_result && SafetyLoopIndex > 0) {
                SafetyLoopIndex--;
                let new_roll = new DieHardFudgeRoll(this._formula, this.data, this.options)
                new_roll.evaluate({async: false})
                evalResult = game.dieHardSystem.evalFudge(new_roll.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)
                if (evalResult) {
                  dieHardLog(false, functionLogName + ' - New result: ' + new_roll.total)
                  gen_new_result = false;
                  foundry.utils.mergeObject(this, new_roll);
                  DieHard.dmToGm('DieHard-Fudge: Total Fudge (' + result.data.fudgeHow + ') values: ' + failedRolls.join(', ') + '  Final: ' + new_roll.total);
                } else {
                  // New roll is insufficient, but lets at least check if it is "closer"
                  if (game.dieHardSystem.isBetterFudge(this.total, new_roll.total, this.data.fudgeOperator, this.data.fudgeOperatorValue)) {
                    dieHardLog(false, functionLogName + ' - New result (' + new_roll.total + ') insufficient (' + this.data.fudgeOperator + ' ' + this.data.fudgeOperatorValue + '), but at least better.  Try again (tries left: ' + SafetyLoopIndex + ')...')
                    foundry.utils.mergeObject(this, new_roll);
                  } else {
                    dieHardLog(false, functionLogName + ' - New result (' + new_roll.total + ') insufficient (' + this.data.fudgeOperator + ' ' + this.data.fudgeOperatorValue + ').  Try again (tries left: ' + SafetyLoopIndex + ')...')
                  }
                  failedRolls.push(new_roll.total);
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
      }
      // No user fudging to occur; continue roll as usual
    }
    return wrapped(eval_options)
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
      // actorFudges: this.getActors(false, true),
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
        } catch (e) {
        }
      }
    }
    return false;
  }

  async refreshActiveFudgesIcon() {
    /*
    Handled in DieHard.refreshDieHardIcons
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globallyDisabled) {
      document.getElementById('die-hard-pause-fudge-icon').classList.remove("die-hard-icon-hidden");
      document.getElementById('die-hard-fudge-icon').classList.add("die-hard-icon-hidden");
      return;
    } else {
      document.getElementById('die-hard-pause-fudge-icon').classList.add("die-hard-icon-hidden");
      document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-icon-hidden");
    }
     */

    // Ugly fix for objects not existing yet
    // ToDo: clean this up
    try{
      if (this.hasActiveFudges()) {
        document.getElementById('die-hard-fudge-icon').classList.add("die-hard-fudge-icon-active");
      } else {
        document.getElementById('die-hard-fudge-icon').classList.remove("die-hard-fudge-icon-active");
      }
    }
    catch (e) {  }
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

  hookReady() {
    dieHardLog(false, 'DieHardSystem : hookReady')
  }

  // game.dieHardSystem.deleteAllFudges()
  deleteAllFudges() {
    dieHardLog(false, 'DieHardSystem : deleteAllFudges')

    // Players
    let users = game.dieHardSystem.getUsers(false);
    for (let user in users) {
      try {
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'fudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'activeFudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'userFudges', null)
      } catch (e) {
      }
    }


    // Players
    let gms = game.dieHardSystem.getUsers(false, false, true);
    for (let user in gms) {
      try {
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'fudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'activeFudges', null)
        game.user.get(users[user].id).setFlag('foundry-die-hard', 'userFudges', null)
      } catch (e) {
      }
    }

  }

  disableAllFudges() {
    dieHardLog(false, 'DieHardSystem : disableAllFudges', game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globallyDisabled)
    let settings = game.settings.get('foundry-die-hard', 'dieHardSettings')
    settings.fudgeConfig.globallyDisabled = !settings.fudgeConfig.globallyDisabled
    game.settings.set('foundry-die-hard', 'dieHardSettings', settings)
    DieHard.refreshDieHardIcons(settings.fudgeConfig.globallyDisabled);
  }

  static registerTests = context => {
    dieHardLog(false, 'DieHardSystem : registerTests')
  }
}
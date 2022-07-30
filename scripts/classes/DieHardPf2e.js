import {dieHardLog} from "../lib/helpers.js";

import DieHardSystem from "./DieHardSystem.js";
//import DieHardFudgeD20Roll from "./DieHardFudgeD20Roll.js";

export default class DieHardPf2e extends DieHardSystem {
  constructor() {
    dieHardLog(false, 'DieHardPf2e - constructor');
    super();

    // ToDo: Disabled for now since not used
    // libWrapper.register('foundry-die-hard', 'game.pf2e.Check.roll', this.wrappedCheckRoll, 'WRAPPER');

    this.totalRollClassName = ["CheckRoll", "StrikeAttackRoll"]
    this.fudgeWhatOptions = []
    /*
    this.fudgeWhatOptions = [
      {
        id: 'actorSavingThrow',
        name: 'Saving Throw'
      },
      {
        id: 'actorSkillCheck',
        name: 'Skill Check'
      },
      {
        id: 'actorMeleeStrike',
        name: 'Melee Strike'
      },
      {
        id: 'actorRangedStrike',
        name: 'Ranged Strike'
      },
      {
        id: 'actorSpellAttack',
        name: 'Spell Attack'
      },
      {
        id: 'pf2eD20',
        name: 'Any PF2e d20'
      }
    ]
     */
  }


  hookReady() {
    dieHardLog(false, 'PF2e System Hook - Ready');
  }

  isPromise(p) {
    if (typeof p === 'object' && typeof p.then === 'function') {
      return true;
    }

    return false;
  }
/*
  fudgeD20Roll(result, evaluate_options) {
    dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll');
    // dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll - result', result);
    let fudgeOperator = result.data.fudgeOperator
    let fudgeOperatorValue = result.data.fudgeOperatorValue

    let gen_new_result = false;
    let evalResult = this.evalFudge(result.total, fudgeOperator, fudgeOperatorValue)
    if (evalResult) {
      dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: Fudge not needed, but still wiped from actor');
      this.dmToGm('DieHard-Fudge: Fudge not needed, but still wiped from actor...');
    } else {
      gen_new_result = true;
      let dmMessage = "Fudge (" + result.data.fudgeHow + ") values:" + result.total;

      // This is a safety to prevent endless loops from possibly sneaking in
      let SafetyLoopIndex = game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
      while (gen_new_result && SafetyLoopIndex > 0) {
        SafetyLoopIndex--;

        // ToDo: Can a "clone()" or a "reroll()" be used instead?  https://foundryvtt.com/api/Roll.html#clone
        const new_roll = new DieHardFudgeD20Roll(
          result.formula,
          result.data, {
            flavor: result.options.flavor,
            advantageMode: result.options.advantageMode,
            defaultRollMode: result.options.defaultRollMode,
            rollMode: result.options.rollMode,
            critical: result.options.critical,
            fumble: result.options.fumble,
            targetValue: result.options.targetValue,
            elvenAccuracy: result.options.elvenAccuracy,
            halflingLucky: result.options.halflingLucky,
            reliableTalent: result.options.reliableTalent
          });
        new_roll.evaluate({async: false, minimize: evaluate_options.minimize, maximize: evaluate_options.maximize});
        dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New roll: ', new_roll)

        evalResult = this.evalFudge(new_roll.total, fudgeOperator, fudgeOperatorValue)
        if (evalResult) {
          dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result: ' + new_roll.total)
          gen_new_result = false;
          foundry.utils.mergeObject(result, new_roll);
          this.dmToGm(dmMessage);
        } else {
          // New roll is insufficient, but lets at least check if it is "closer"
          if (this.isBetterFudge(result.total, new_roll.total, fudgeOperator, fudgeOperatorValue)) {
            dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result insufficient, but at least better (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
            foundry.utils.mergeObject(result, new_roll);
          } else {
            dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result insufficient (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
          }
          dmMessage += ',' + new_roll.total;
        }
      }
      if (SafetyLoopIndex === 0) {
        dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: Tried until retry safety killed...');
        this.dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
      }
    }

    dieHardLog(false, 'Done with modify_results', result);
    return result
  }

  d20rollEvaluate(wrapped, evaluate_options) {
    dieHardLog(false, 'DieHardDnd5e.d20rollEvaluate', this.data);

    let fudge = false;
    if (this.data.fudge === true) {
      evaluate_options.async = false;


      if (this instanceof CONFIG.Dice.DieHardFudgeD20Roll) {
        // This is a recursive roll; do sync
        evaluate_options.async = false;
      } else {
        // This is a root roll, so allow fudge re-roll
        fudge = true;
      }
    } else {
      dieHardLog(false, 'DieHardDnd5e.d20rollEvaluate - No fudging planned for this roll');
    }

    let result = wrapped.call(evaluate_options)
    // If a fudge re-roll is allowed
    if (fudge) {
      result.then(function (value) {
        game.settings.get('foundry-die-hard', 'dieHardSettings').system.fudgeD20Roll(value, evaluate_options)
      })
    }


    return result
  }
  */
  /**
   * Generic wrapper for all PF2e Check rolls
   */
  wrappedCheckRoll(wrapped, check, context, event, callback) {
    dieHardLog(true, 'DieHardPf2e.wrappedCheckRoll - this', this);
    dieHardLog(true, 'DieHardPf2e.wrappedCheckRoll - arguments.length', arguments.length);
    dieHardLog(true, 'DieHardPf2e.wrappedCheckRoll - arguments', arguments);

    if (game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable) {
      dieHardLog(true, 'DieHardPf2e.wrappedCheckRoll - Globally disabled', game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.globalDisable);
      // Globally disabled
      wrapped(check, context, event, callback);
      return
    }

    // Convert PF2e check to rollType
    let rollType = 'pf2eD20'
    if (check.name.indexOf('Saving Throw')) {
      rollType = 'actorSavingThrow'
    } else if (check.name.indexOf('Skill Check')) {
      rollType = 'actorSkillCheck'
    } else if (check.name.indexOf('Melee Strike')) {
      rollType = 'actorMeleeStrike'
    } else if (check.name.indexOf('Ranged Strike')) {
      rollType = 'actorRangedStrike'
    } else if (check.name.indexOf('Spell Attack')) {
      rollType = 'actorSpellAttack'
    }

    // Check if actor has an active fudge
    let actorFudges = game.actors.get(context.actor.id).getFlag('foundry-die-hard', 'fudges');
    if (!Array.isArray(actorFudges)) {
      actorFudges = []
    }
    dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - actorFudges', actorFudges);
    let fudgeIndex = actorFudges.findIndex(element => {
      return element.whatId === rollType;
    });
    if (fudgeIndex !== -1 && actorFudges[fudgeIndex].statusActive) {
      dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - active actor fudge', actorFudges[fudgeIndex]);
      foundry.utils.mergeObject(check, {
        data: {
          fudge: true,
          fudgeOperator: actorFudges[fudgeIndex].operator,
          fudgeOperatorValue: actorFudges[fudgeIndex].operatorValue,
          fudgeHow: actorFudges[fudgeIndex].howFormula
        }
      });
      if (actorFudges[fudgeIndex].statusEndless) {
        dieHardLog(false, 'DieHardSystem.wrappedRoll - fudge is endless');
      } else {
        // Disable the fudge
        actorFudges[fudgeIndex].statusActive = false

        // Delete the fudge from the actor
        //let deletedFudge = actorFudges.splice(fudgeIndex, 1)
        game.actors.get(context.actor.id).setFlag('foundry-die-hard', 'fudges', actorFudges);
        // Check if still have active fudges;
        game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon();
      }
      dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - merged check', check);
    }

    // Check if user has an active fudge
    let userFudges = game.users.current.getFlag('foundry-die-hard', 'fudges');
    dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - userFudges', userFudges);
    if (!Array.isArray(userFudges)) {
      userFudges = []
    }
    fudgeIndex = userFudges.findIndex(element => {
      return element.whatId === rollType;
    });
    if (fudgeIndex !== -1 && userFudges[fudgeIndex].statusActive) {
      dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - active user fudge', userFudges[fudgeIndex]);
      foundry.utils.mergeObject(check, {
        data: {
          fudge: true,
          fudgeOperator: userFudges[fudgeIndex].operator,
          fudgeOperatorValue: userFudges[fudgeIndex].operatorValue,
          fudgeHow: userFudges[fudgeIndex].howFormula
        }
      });
      if (userFudges[fudgeIndex].statusEndless) {
        dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - fudge is endless');
      } else {
        // Disable the fudge
        userFudges[fudgeIndex].statusActive = false

        // Delete the fudge from the user
        // let deletedFudge = userFudges.splice(fudgeIndex, 1)
        game.users.current.setFlag('foundry-die-hard', 'fudges', userFudges);
        // Check if still have active fudges;
        game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon();
      }
      dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - merged check', check);
    }
    let result = wrapped(check, context, event, callback);
    dieHardLog(false, 'DieHardPf2e.wrappedCheckRoll - result', result);
  }

/*
  actorRollSave(wrapped, skillId, options = {}) {
    dieHardLog(true, 'DieHardPf2e.actorRollSave', this, arguments.length);
    // game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollSkill')
    wrapped(skillId, options);
  }

  actorRollAttribute(wrapped, event, attributeName) {
    dieHardLog(true, 'DieHardPf2e.actorRollAttribute', this, arguments.length, event, attributeName);
    // game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollAbilitySave')
    wrapped(abilityId, options);
  }

  d20Roll(wrapped, event, item, pars, data, template, title, speaker, flavor, onClose, dialogOptions, rollMode, rollType) {
    dieHardLog(true, 'DieHardPf2e.d20Roll', this, arguments.length, event, attributeName);
    // game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollAbilitySave')
    wrapped(abilityId, options);
  }

  checkRoll(wrapped, check, context, event, callback) {
    dieHardLog(true, 'DieHardPf2e.checkRoll - this', this);
    dieHardLog(true, 'DieHardPf2e.checkRoll - arguments.length', arguments.length, check, context, event, callback);
    // game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollAbilitySave')
    wrapped(check, context, event, callback);
  }
*/
  /*
  actorRollAbilityTest(wrapped, abilityId, options = {}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollAbilityTest', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollAbilityTest')
    wrapped(abilityId, options);
  }

  actorRollDeathSave(wrapped, options = {}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollDeathSave', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollDeathSave')
    wrapped(options);
  }

  entityRollAttack(wrapped, options = {}) {
    dieHardLog(false, 'DieHardDnd5e.entityRollAttack', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.actor.id, 'entityRollAttack')
    wrapped(options);
  }
  */

}


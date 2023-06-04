import {dieHardLog} from "../lib/helpers.js";

import DieHardSystem from "./DieHardSystem.js";
//import DieHardFudgeD20Roll from "./DieHardFudgeD20Roll.js";
import {DieHardSetting} from "./DieHard.js";

export default class DieHardDnd5e extends DieHardSystem{
  constructor() {
    // Dynamic register
    let DieHardFudgeD20RollImport
    if (isNewerVersion(game.version, 9.99999)) {
      console.log('Newer')
      DieHardFudgeD20RollImport = import('./DieHardFudgeD20Roll-v10.js')
    } else {
      console.log('Older')
      DieHardFudgeD20RollImport = import('./DieHardFudgeD20Roll.js')
    }
    dieHardLog(false, 'DieHardDnd5e.constructor');
    super();

    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollAbilitySave', this.actorRollAbilitySave, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollSkill', this.actorRollSkill, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollAbilityTest', this.actorRollAbilityTest, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollDeathSave', this.actorRollDeathSave, 'WRAPPER');

    libWrapper.register('foundry-die-hard', 'CONFIG.Item.documentClass.prototype.rollAttack', this.entityRollAttack, 'WRAPPER');

    libWrapper.register('foundry-die-hard', 'game.dnd5e.dice.D20Roll.prototype._evaluate', this.d20rollEvaluate, 'WRAPPER');

    // See notes in DieHardFudgeD20Roll
    CONFIG.Dice.DieHardFudgeD20Roll = DieHardFudgeD20RollImport.DieHardFudgeD20Roll;

    this.totalRollClassName = ["Roll", "D20Roll"]
    this.fudgeWhatOptions = [
      {
        id: 'actorRollSkill',
        name: 'Skill Roll'
      },
      {
        id: 'actorRollAbilitySave',
        name: 'Ability Save'
      },
      {
        id: 'actorRollAbilityTest',
        name: 'Ability Test'
      },
      {
        id: 'actorRollDeathSave',
        name: 'Death Save'
      },
      {
        id: 'entityRollAttack',
        name: 'Weapon/Spell/Feat Attack'
      }
    ]
  }

  hookReady() {
    dieHardLog(false, 'Dnd 5e System Hook - Ready');
  }


  fudgeD20Roll(result, evaluate_options) {
    let functionLogName = 'DieHardDnd5e.fudgeD20Roll'
    dieHardLog(false, functionLogName);
    // dieHardLog(false, functionLogName + ' - result', result);
    let fudgeOperator = result.data.fudgeOperator
    let fudgeOperatorValue = result.data.fudgeOperatorValue

    let gen_new_result = false;
    let evalResult = this.evalFudge(result.total, fudgeOperator, fudgeOperatorValue)
    if (evalResult) {
      dieHardLog(false, functionLogName + ' - Fudge not needed, but still wiped from actor');
      this.dmToGm('DieHard-Fudge: Fudge not needed, but still wiped from actor...');
    } else {
      gen_new_result = true;
      let dmMessage = "Fudge (" + result.data.fudgeHow + ")\nValues:" + result.total;

      // This is a safety to prevent endless loops from possibly sneaking in
      let SafetyLoopIndex = game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
      while (gen_new_result && SafetyLoopIndex > 0) {
        SafetyLoopIndex--;

        // ToDo: Can a "clone()" or a "reroll()" be used instead?  https://foundryvtt.com/api/Roll.html#clone
        const new_roll = new DISABLED_DieHardFudgeD20Roll(
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
        new_roll.evaluate({ async: false, minimize: evaluate_options.minimize, maximize: evaluate_options.maximize });
        dieHardLog(false, functionLogName + ' - New roll: ', new_roll)

        evalResult = this.evalFudge(new_roll.total, fudgeOperator, fudgeOperatorValue)
        if (evalResult) {
          dieHardLog(false, functionLogName + ' - New result: ' + new_roll.total)
          gen_new_result = false;
          foundry.utils.mergeObject(result, new_roll);
          this.dmToGm(dmMessage);
        } else {
          // New roll is insufficient, but lets at least check if it is "closer"
          if (this.isBetterFudge(result.total, new_roll.total, fudgeOperator, fudgeOperatorValue)) {
            dieHardLog(false, functionLogName + ' - New result insufficient, but at least better (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
            foundry.utils.mergeObject(result, new_roll);
          } else {
            dieHardLog(false, functionLogName + ' - New result insufficient (' + new_roll.total + ").  Try again (tries left: " + SafetyLoopIndex + ")...")
          }
          dmMessage += ',' + new_roll.total;
        }
      }
      if (SafetyLoopIndex === 0) {
        dieHardLog(false, functionLogName + ' - Tried until retry safety killed...');
        this.dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
      }
    }

    dieHardLog(false, functionLogName + ' -Done with modify_results', result);
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
    if (fudge){
      result.then(function(value) {game.dieHardSystem.fudgeD20Roll(value, evaluate_options)})
    }

    return result
  }

  wrappedRoll(options, actorId, rollType) {
    let functionLogName = 'DieHardDnd5e.wrappedRoll'
    dieHardLog(false, functionLogName + ' - rollType', rollType);

    if (! DieHardSetting('fudgeEnabled') ) {
      dieHardLog(false, functionLogName + ' - Fudge disabled');
    } else if (DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      dieHardLog(false, functionLogName + ' - Fudging Globally disabled');
    } else {
      // Check if user has an active fudge
      let userFudge = this.getUserFudge(rollType)
      if (userFudge !== null) {
        dieHardLog(false, functionLogName + ' - active user fudge', userFudge);
        foundry.utils.mergeObject(options, {
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
          // Disable the fudge
          this.disableUserFudge(userFudge.id)
        }
      }
    }
  }

  actorRollSkill(wrapped, skillId, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollSkill', this);
    if (!DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      game.dieHardSystem.wrappedRoll(options, this.id, 'actorRollSkill')
    }
    wrapped(skillId, options);
  }

  actorRollAbilitySave(wrapped, abilityId, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollAbilitySave', this);
    if (!DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      game.dieHardSystem.wrappedRoll(options, this.id, 'actorRollAbilitySave')
    }
    wrapped(abilityId, options);
  }

  actorRollAbilityTest(wrapped, abilityId, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollAbilityTest', this);
    if (!DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      game.dieHardSystem.wrappedRoll(options, this.id, 'actorRollAbilityTest')
    }
    wrapped(abilityId, options);
  }

  actorRollDeathSave(wrapped, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollDeathSave', this);
    if (!DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      game.dieHardSystem.wrappedRoll(options, this.id, 'actorRollDeathSave')
    }
    wrapped(options);
  }

  entityRollAttack(wrapped, options={}) {
    dieHardLog(false, 'DieHardDnd5e.entityRollAttack', this);
    if (!DieHardSetting('dieHardSettings').fudgeConfig.globallyDisabled) {
      game.dieHardSystem.wrappedRoll(options, this.actor.id, 'entityRollAttack')
    }
    wrapped(options);
  }


}


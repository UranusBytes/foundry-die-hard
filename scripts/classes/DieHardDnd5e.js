import {dieHardLog} from "../lib/helpers.js";
import {DieHardSystem} from "./DieHardSystem.js";
import {DieHardFudgeD20Roll} from "./DieHardFudgeD20Roll.js";

export class DieHardDnd5e extends DieHardSystem{
  constructor() {
    dieHardLog(false, 'DieHardDnd5e - constructor');
    super();
    this.init();
  }

  init() {
    dieHardLog(false, 'DieHardDnd5e - init');

    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollAbilitySave', this.actorRollAbilitySave, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollSkill', this.actorRollAbilitySave, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollAbilityTest', this.actorRollAbilityTest, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollDeathSave', this.actorRollAbilitySave, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'CONFIG.Item.documentClass.prototype.rollAttack', this.entityRollAttack, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'game.dnd5e.dice.D20Roll.prototype._evaluate', this.d20rollEvaluate, 'WRAPPER');

    // See notes in DieHardFudgeD20Roll
    CONFIG.Dice.DieHardFudgeD20Roll = DieHardFudgeD20Roll;

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
      // ,
      // {
      //   id: 'genericD20roll',
      //   name: 'Any DND5e D20 Roll'
      // }
    ]
  }

  hookReady() {
    dieHardLog(false, 'Dnd 5e System Hook - Ready');
  }

  getFudgeActors() {
    dieHardLog(false, 'DieHardDnd5e - getFudgeActors');
    let whoActors = []
    for (let actorId of game.actors.keys()) {
      let curActor = game.actors.get(actorId);
      if(curActor.data.type === 'character') {
        whoActors.push({id: actorId, name: curActor.name})
      }
    }
    return whoActors;
  }

  getFudgeWhatOptions() {
    return this.fudgeWhatOptions;
  }

  _evalFudge(result, operator, operatorValue) {
    dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll - _evalFudge', result, operator, operatorValue);
    switch (operator) {
      case '>':   return result > operatorValue;
      case '<':   return result < operatorValue;
      case '>=':  return result >= operatorValue;
      case '<=':  return result <= operatorValue;
      case '!=':  return result !== operatorValue;
      case '=': return result === operatorValue;
    }
  }
  isPromise(p) {
  if (typeof p === 'object' && typeof p.then === 'function') {
    return true;
  }

  return false;
}
  fudgeD20Roll(result, evaluate_options) {
    dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll');
    let fudgeOperator = result.data.fudgeOperator
    let fudgeOperatorValue = result.data.fudgeOperatorValue

    let gen_new_result = false;
    let evalResult = this._evalFudge(result.total, fudgeOperator, fudgeOperatorValue)
    if (evalResult) {
      dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: Fudge not needed, but still wiped from actor');
      this._dmToGm('DieHard-Fudge: Fudge not needed, but still wiped from actor...');
    } else {
      gen_new_result = true;
      let dmMessage = "Fudge (" + result.data.fudgeHow + ") values:" + result.total;

      // This is a safety to prevent endless loops from possibly sneaking in
      let SafetyLoopIndex = game.settings.get('foundry-die-hard', 'dieHardSettings').fudgeConfig.maxFudgeAttemptsPerRoll;
      while (gen_new_result && SafetyLoopIndex > 0) {
        SafetyLoopIndex--;

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

        evalResult = this._evalFudge(new_roll.total, fudgeOperator, fudgeOperatorValue)
        if (evalResult) {
          dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result: ' + new_roll.total)
          gen_new_result = false;
          foundry.utils.mergeObject(result, new_roll);
          this._dmToGm(dmMessage);
        } else {
          dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result insufficient (' + new_roll.total + ").  Try again...")
          dmMessage += ',' + new_roll.total;
        }
      }
      if (SafetyLoopIndex === 0) {
        dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: Tried until retry safety killed...');
        this._dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
      }
    }

    dieHardLog(false, 'Done with modify_results', result);
  }

  d20rollEvaluate(wrapped, evaluate_options) {
    dieHardLog(false, 'DieHardDnd5e.d20rollEvaluate');

    let fudge = false;
    // Determine if fudge is active
      dieHardLog(false, 'DieHardDnd5e.d20rollEvaluate - this', this);
    if (this.data.fudge === true) {
      // ToDo: Only enable if fudge is active
      evaluate_options.async = false;

      if (this instanceof CONFIG.Dice.DieHardFudgeD20Roll) {
        // This is a recursive roll; do sync
        evaluate_options.async = false;
      } else {
        // This is a root roll, so allow fudge re-roll
        fudge = true;
      }
    } else {
      console.log('No fudging today!')
    }
    let result = wrapped(evaluate_options);

    // If a fudge re-roll is allowed
    if (fudge){
      result.then((value) => game.settings.get('foundry-die-hard', 'dieHardSettings').system.fudgeD20Roll(value, evaluate_options));
    }
    return result
  }

  wrappedRoll(options, actorId, rollType) {
    dieHardLog(false, 'DieHardDnd5e.wrappedRoll', this);

    // Check if actor has an active fudge
    let actorFudges = game.actors.get(actorId).getFlag('foundry-die-hard', 'activeFudges');
    dieHardLog(false, 'DieHardDnd5e.wrappedRoll - actorFudges', actorFudges);
    let fudgeIndex = actorFudges.findIndex(element => { return element.what === rollType;});
    if (fudgeIndex !== -1) {
      dieHardLog(false, 'Actor has active fudge', actorFudges[fudgeIndex].how);
      foundry.utils.mergeObject(options, {data: {fudge: true, fudgeOperator: actorFudges[fudgeIndex].operator, fudgeOperatorValue: actorFudges[fudgeIndex].operatorValue, fudgeHow: actorFudges[fudgeIndex].how }});
      // Delete the fudge from the actor
      let deletedFudge = actorFudges.splice(fudgeIndex,1)
      game.actors.get(actorId).setFlag('foundry-die-hard', 'activeFudges', actorFudges);
    }
  }

  actorRollSkill(wrapped, skillId, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollSkill', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollSkill')
    wrapped(skillId, options);
  }

  actorRollAbilitySave(wrapped, abilityId, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollAbilitySave', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollAbilitySave')
    wrapped(abilityId, options);
  }

  actorRollAbilityTest(wrapped, abilityId, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollAbilityTest', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollAbilityTest')
    wrapped(abilityId, options);
  }

  actorRollDeathSave(wrapped, options={}) {
    dieHardLog(false, 'DieHardDnd5e.actorRollDeathSave', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.id, 'actorRollDeathSave')
    wrapped(options);
  }

  entityRollAttack(wrapped, options={}) {
    dieHardLog(false, 'DieHardDnd5e.entityRollAttack', this);
    game.settings.get('foundry-die-hard', 'dieHardSettings').system.wrappedRoll(options, this.actor.id, 'entityRollAttack')
    wrapped(options);
  }
}


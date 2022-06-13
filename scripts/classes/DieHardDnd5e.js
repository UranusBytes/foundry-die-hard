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
    libWrapper.register('foundry-die-hard', 'game.dnd5e.dice.D20Roll.prototype._evaluate', this.d20rollEvaluate, 'WRAPPER');

    // See notes in DieHardFudgeD20Roll
    CONFIG.Dice.DieHardFudgeD20Roll = DieHardFudgeD20Roll;

    this.fudgeWhatOptions = [
      {
        id: 'actorSkillRoll',
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
        id: 'actorDeathSave',
        name: 'Death Save'
      },
      {
        id: 'entityWeaponsToHit',
        name: 'Weapons To Hit'
      },
      {
        id: 'entitySpellToHit',
        name: 'Spells To Hit'
      },
      {
        id: 'genericD20roll',
        name: 'Any DND5e D20 Roll'
      }
    ]
  }

  hookReady() {
    dieHardLog(false, 'Dnd 5e System Hook - Ready');

    // See comment in init
    // var readyPromise = import("./DieHardFudgeD20Roll.js");
    // readyPromise.then(this.registerDieHardFudgeD20Roll);

  }

  // registerDieHardFudgeD20Roll() {
  //   dieHardLog('Dnd 5e System  - register DieHardFudgeD20Roll');
  //   CONFIG.Dice.DieHardFudgeD20Roll = DieHardFudgeD20Roll;
  // }


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

  fudgeD20Roll(result, evaluate_options) {
    dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll');
    const minResult = 15;
    var gen_new_result = false;
    if (result.total <= minResult) {
      gen_new_result = true;
    }
    this._dmToGm("DieHardDnd5e - fudgeD20Roll: Original total: " + result.total);

    // This is a safety to prevent endless loops from possibly sneaking in
    let SafetyLoopIndex = 100;

    while (gen_new_result && SafetyLoopIndex > 0) {

      // console.log('Loop index: ' + CONFIG.debug.FudgeD20RollLoopIndex)
      SafetyLoopIndex--;

      // console.log('Create new roll')
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

      if (new_roll.total > minResult) {
        dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result: ' + new_roll.total )
        gen_new_result = false;
        foundry.utils.mergeObject(result, new_roll);
      } else {
        dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: New result insufficient (' + new_roll.total + ").  Try again...")
        this._dmToGm('DieHard-Fudge: New result insufficient (' + new_roll.total + ")");
      }
    }

    if (SafetyLoopIndex === 0) {
      dieHardLog(false, 'DieHardDnd5e - fudgeD20Roll: Tried until retry safety killed...');
      this._dmToGm('DieHard-Fudge: Gave up trying to fudge; loop safety reached...');
    }

    dieHardLog(false, 'Done with modify_results', result);
  }

  d20rollEvaluate(wrapped, evaluate_options) {
    dieHardLog(false, 'DieHardDnd5e.d20rollEvaluate');

    let fudge = false;
    // Determine if fudge is active
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
      result.then((value) => game.diehard.system.fudgeD20Roll(value, evaluate_options));
    }
    return result
  }

  actorRollAbilitySave(wrapped, skillId, options={}) {
    dieHardLog(false, 'dnd5e_Actor5e_rollAbilitySave', this);

    // Check if fudge is active
    if (true) {
      foundry.utils.mergeObject(options, {data: {fudge: true}});
    }

    wrapped(skillId, options);
  }
}


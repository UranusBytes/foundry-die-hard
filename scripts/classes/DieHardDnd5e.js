export class DieHardDnd5e extends DieHardSystem{
  constructor() {
    super();
  }

  init() {

  }
}




function fudge_d20Roll(result, evaluate_options) {
  console.log('fudge_d20Roll');
  const minResult = 15;
  var gen_new_result = false;
  if (result.total <= minResult) {
    gen_new_result = true;
  }
  _dmToGm("DieHard-Fudge: Original total: " + result.total);

  var SafetyLoopIndex = 100;

  while (gen_new_result && SafetyLoopIndex > 0) {

    // console.log('Loop index: ' + CONFIG.debug.FudgeD20RollLoopIndex)
    SafetyLoopIndex--;

    // console.log('Create new roll')
    const new_roll = new CONFIG.Dice.FudgeD20Roll(
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
      console.log('DieHard Fudge: New result: ' + new_roll.total )
      gen_new_result = false;
      foundry.utils.mergeObject(result, new_roll);
    } else {
      console.log('DieHard Fudge: New result insufficient (' + new_roll.total + ").  Try again...")
      _dmToGm('DieHard-Fudge: New result insufficient (' + new_roll.total + ")");
    }
  }

  console.log('Done with modify_results');
  console.log(result);
}

export function dnd5e_d20Roll_evaluate(wrapped, evaluate_options) {
  console.log('dnd5e_d20Roll_evaluate');

  var fudge = false;
  // Determine if fudge is active
  if (this.data.fudge == true) {
    // ToDo: Only enable if fudge is active
    evaluate_options.async = false;

    if (this instanceof CONFIG.Dice.FudgeD20Roll) {
      // This is a recursive roll; do sync
      evaluate_options.async = false;
    } else {
      // This is a root rool, so allow fudge re-roll
      fudge = true;
    }
  } else {
    console.log('No fudging today!')
  }
  let result = wrapped(evaluate_options);

  // If a fudge re-roll is allowed
  if (fudge){
    result.then((value) => fudge_d20Roll(value, evaluate_options));
  }
  return result
}

export function dnd5e_Actor5e_rollAbilitySave(wrapped, skillId, options={}) {
  console.log('dnd5e_Actor5e_rollAbilitySave');
  console.log(this);

  // Check if fudge is active
  if (true) {
    foundry.utils.mergeObject(options, {data: {fudge: true}});
  }

  let result = wrapped(skillId, options);
}

// ---- Actor
// rollSkill
// rollAbilitySave
// rollAbilityTest
// rollDeathSave
// roll
// items: weapons
// items: spells
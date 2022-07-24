/*
Because this extends D20Roll, I could not find a clean way to import.  I tried multiple hacks, and ended up following this example:

// CONFIG.Dice.D20Roll
// game.dnd5e.dice.D20Roll

 */

import D20Roll from '../../../../systems/dnd5e/module/dice/d20-roll.js'
import {dieHardLog} from "../lib/helpers.js";

export class DieHardFudgeD20Roll extends D20Roll {
  // This is a simple extension
  constructor(formula, data, options) {
    super(formula, data, options);
  }
 static get defaultOptions() {
   return super.defaultOptions;
 }

 evaluate({minimize=false, maximize=false, async}={}) {
   dieHardLog(false, 'DieHardDnd5e - D20Roll: evaluate: ', async)
    super.evaluate({minimize: minimize, maximize: maximize, async: async})
 }
}

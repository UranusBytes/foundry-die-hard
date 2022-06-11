
import {
  dnd5e_Actor5e_rollAbilitySave,
  dnd5e_d20Roll_evaluate
} from './classes/DieHardDnd5e.js'

import DieHardFudgeDialog from "./classes/DieHardFudgeDialog.js";


Hooks.once('init', () => {
  console.log('Die Hard | Initializing...')

  // init die-hard settings
  Object.defineProperty(game, 'diehard', {
      value: new DieHardConfig(),
      configurable: true,
      writable: true,
      enumerable: false,
    });

  if (game.system.id == 'dnd5e') {
    class FudgeD20Roll extends game.dnd5e.dice.D20Roll {
      // This is a simple extension
      constructor(formula, data, options) {
        super(formula, data, options);
      }
    }
    CONFIG.Dice.FudgeD20Roll = FudgeD20Roll;

    CONFIG.debug.FudgeD20RollLoopIndex = 15;
    libWrapper.register('foundry-die-hard', 'CONFIG.Actor.documentClass.prototype.rollAbilitySave', dnd5e_Actor5e_rollAbilitySave, 'WRAPPER');
    libWrapper.register('foundry-die-hard', 'game.dnd5e.dice.D20Roll.prototype._evaluate', dnd5e_d20Roll_evaluate, 'WRAPPER');
    //libWrapper.register('foundry-die-hard', 'game.dnd5e.dice.D20Roll.prototype.constructor', dnd5e_d20Roll_constructor, 'WRAPPER');

    // Can't, as configurable: false
    //libWrapper.register('foundry-die-hard', 'game.dnd5e.dice.d20Roll', dnd5e_d20Roll, 'MIXED');

  } else {
    console.log('Unsupport game system: ' + game.system.id)
  }
});

Hooks.once('ready', () => {
  console.log('Die Hard | Ready...')
});

Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;

  console.log('renderSidebarTab');

  //let button = $(`<button class='die-hard-fudge'><i class="fas fa-poop"></i></button>`);
  // let button = $(`<div class="control-buttons"><a class="die-hard-fudge" title="Die Hard Fudge"><i class="fas fa-poop"></i></a></div>`);
  let button = $(`<label class="die-hard-fudge-icon"><i class="fas fa-poop"></i></label>`);

  button.click(async (ev) => {
                new DieHardFudgeDialog().render(true);
            });
  button.insertAfter(html.find("#chat-controls .chat-control-icon"))
});




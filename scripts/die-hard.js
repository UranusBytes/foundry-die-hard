
import {dieHardLog} from "./lib/helpers.js";

'./lib/helpers.js';

import {DieHardFudgeDialog} from "./classes/DieHardFudgeDialog.js";
import DieHardConfig from "./classes/DieHardConfig.js";

// Debug
// if (CONFIG.debug.dieHard === null) {
//   CONFIG.debug.dieHard = true;
// } else {
//   // Do something
//   CONFIG.debug.dieHard = true;
// }

Hooks.once('init', () => {
  dieHardLog(true, 'Initializing...')

  DieHardConfig.registerSettings();

});

Hooks.once('ready', () => {
  dieHardLog(true, 'Ready...')
  game.settings.get('foundry-die-hard', 'dieHardSettings').system.hookReady();

});

Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;

  dieHardLog(false, 'Render side bar')
  let button = $(`<label class="die-hard-fudge-icon"><i class="fas fa-poop"></i></label>`);
  button.click(async (ev) => {
                new DieHardFudgeDialog().render(true);
            });
  button.insertAfter(html.find("#chat-controls .chat-control-icon"))
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('foundry-die-hard');
});


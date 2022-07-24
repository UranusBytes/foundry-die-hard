
import {dieHardLog, insertAfter} from "./lib/helpers.js";
import {registerDieHardTests} from "./classes/DieHardTests.js";

import DieHard from "./classes/DieHard.js";
import DieHardFudgeDialog from "./classes/DieHardFudgeDialog.js";
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

  // CONFIG.diehard.allActors = true;
  DieHardConfig.registerSettings();

});

Hooks.once('ready', () => {
  dieHardLog(true, 'Ready...')
  game.settings.get('foundry-die-hard', 'dieHardSettings').system.hookReady();
});

Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;

  if (document.getElementById('die-hard-fudge-icon') == null) {
    // Button hasn't been added yet
    dieHardLog(false, 'Render side bar')
    let button = document.createElement('label');
    button.setAttribute('id', 'die-hard-fudge-icon');
    button.classList.add('die-hard-fudge-icon');
    button.innerHTML = '<i class="fas fa-poop"></i>';

    if (game.settings.get('foundry-die-hard', 'dieHardSettings').system.hasActiveFudges()) {
      button.classList.add('die-hard-fudge-icon-active');
    }

    button.addEventListener("click", async (ev) => {
                  new DieHardFudgeDialog().render(true);
              });
    button.addEventListener("contextmenu", async (ev) => {
                  game.settings.get('foundry-die-hard', 'dieHardSettings').system.disableAllFudges();
              });

    // ToDo: Fix this ugly hack
    // the document object isn't existing sometimes yet, so just ignore.  It'll eventually render
    try {
      insertAfter(button, document.querySelector('.chat-control-icon'));
    }
    catch (e) {  }
  }
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('foundry-die-hard');
});

// If FVTT-Quench installed, register tests
Hooks.on('quenchReady', registerDieHardTests);

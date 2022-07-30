
import {dieHardLog, insertAfter} from "./lib/helpers.js";
import {registerDieHardTests} from "./classes/DieHardTests.js";

import DieHard from "./classes/DieHard.js";
import DieHardConfig from "./classes/DieHardConfig.js";
import DieHardVersionNotification from "./classes/DieHardVersionNotification.js";

Hooks.once('init', () => {
  dieHardLog(true, 'Initializing...')

  // CONFIG.diehard.allActors = true;
  DieHardConfig.registerSettings();

});

Hooks.once('ready', () => {
  dieHardLog(true, 'Ready...')
  if (game.settings.get('foundry-die-hard', 'dieHardSettings').system == null) {
    dieHardLog(false, 'Unsupported system for world; not rendering side bar')
    return
  }
  game.settings.get('foundry-die-hard', 'dieHardSettings').system.hookReady();

  // Check if new version; if so send DM to GM
  DieHardVersionNotification.checkVersion()
});

Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;

  if (document.getElementById('die-hard-fudge-icon') == null) {
    // Button hasn't been added yet
    //dieHardLog(true, 'debounce...')
    // ToDo: Figure out how to debounce this
    DieHard.renderFudgeIcon()
    // foundry.utils.debounce(() => , 100)
  }
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('foundry-die-hard');
});

// If FVTT-Quench installed, register tests
Hooks.on('quenchReady', registerDieHardTests);

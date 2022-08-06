
import {dieHardLog, insertAfter} from "./lib/helpers.js";

import DieHard, {DieHardSetting} from "./classes/DieHard.js";
import DieHardVersionNotification from "./classes/DieHardVersionNotification.js";

Hooks.once('init', () => {
  dieHardLog(true, 'Initializing...')
  DieHard.registerSettings();
  debounce(DieHard.refreshDieHardIcons, 500)
});

Hooks.once('ready', () => {
  dieHardLog(true, 'Ready...')
  if (DieHardSetting('dieHardSettings').system == null) {
    dieHardLog(false, 'Unsupported system for world; not rendering side bar')
    return
  }
  DieHardSetting('dieHardSettings').system.hookReady();

  // Check if new version; if so send DM to GM
  DieHardVersionNotification.checkVersion()

  if (game.modules.get("betterrolls5e") !== undefined && game.modules.get("betterrolls5e")?.active === true) {
    dieHardLog(true, 'WARNING - DieHard is incompatible with Better Rolls 5e.')
    DieHardSetting('dieHardSettings').system.dmToGm('WARNING - DieHard is incompatible with Better Rolls 5e.');
  }
});

Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;

  if (document.getElementById('die-hard-fudge-icon') == null) {
    // ToDo: Figure out how to debounce this
    DieHard.renderDieHardIcons()
    // foundry.utils.debounce(() => , 100)
  }
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag('foundry-die-hard');
});



import {dieHardLog} from "./lib/helpers.js";

'./lib/helpers.js';
import {DieHardDnd5e} from './classes/DieHardDnd5e.js'
import {DieHardFudgeDialog} from "./classes/DieHardFudgeDialog.js";
import DieHardConfig from "./classes/DieHardConfig.js";

// Debug
if (CONFIG.debug.dieHard === null) {
  CONFIG.debug.dieHard = true;
} else {
  // Do something
  CONFIG.debug.dieHard = true;
}

Hooks.once('init', () => {
  dieHardLog('Initializing...', true)

  // init die-hard settings
  Object.defineProperty(game, 'diehard', {
      value: new DieHardConfig(),
      configurable: true,
      writable: true,
      enumerable: false,
    });

  if (game.system.id == 'dnd5e') {
    dieHardLog('Configuring for dndn5e system', true)
    game.diehard.system = new DieHardDnd5e;

  } else {
    dieHardLog('Unsupport game system: ' + game.system.id, true)
  }
});

Hooks.once('ready', () => {
  dieHardLog('Ready...', true)
  game.diehard.system.hookReady();
});

Hooks.on('renderSidebarTab', (app, html, data) => {
  // Only display for GM
  if (!game.user.isGM) return;

  dieHardLog('Render side bar')
  let button = $(`<label class="die-hard-fudge-icon"><i class="fas fa-poop"></i></label>`);
  button.click(async (ev) => {
                new DieHardFudgeDialog().render(true);
            });
  button.insertAfter(html.find("#chat-controls .chat-control-icon"))
});




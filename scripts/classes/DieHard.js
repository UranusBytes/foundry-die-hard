import {dieHardLog, insertAfter} from "../lib/helpers.js";
import DieHardFudgeDialog from "./DieHardFudgeDialog.js";


export default class DieHard {

  constructor() {
    dieHardLog(true, 'DieHard - constructor');

    // Setup default settings;

  }

  init() {
    dieHardLog(true, 'DieHard - init');
  }

  static renderFudgeIcon() {
    if (game.settings.get('foundry-die-hard', 'dieHardSettings').system == null) {
      dieHardLog(false, 'Unsupported system for world; not rendering side bar')
      return
    }
    dieHardLog(false, 'Render side bar')
    let fudgeButton = document.createElement('label');
    //fudgeButton.setAttribute('id', 'die-hard-fudge-icon');
    fudgeButton.classList.add('die-hard-fudge-icon');
    fudgeButton.innerHTML = '<div class="die-hard-pause-fudge-overlay"><i id="die-hard-pause-fudge-icon" class="fas fa-pause-circle"></i></div><i id="die-hard-fudge-icon" class="fas fa-poop"></i>';

    fudgeButton.addEventListener("click", async (ev) => {
                  new DieHardFudgeDialog().render(true);
              });
    fudgeButton.addEventListener("contextmenu", async (ev) => {
                  game.settings.get('foundry-die-hard', 'dieHardSettings').system.disableAllFudges();
              });

    // ToDo: Fix this ugly hack
    // the document object isn't existing sometimes yet, so just ignore.  It'll eventually render
    try {
      //insertAfter(pauseButton, document.querySelector('.chat-control-icon'));
      insertAfter(fudgeButton, document.querySelector('.chat-control-icon'));
      game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon()
    }
    catch (e) {  }
  }
}
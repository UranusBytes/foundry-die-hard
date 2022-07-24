import {dieHardLog} from "../lib/helpers.js";
import DieHardDnd5e from "./DieHardDnd5e.js";

export default class DieHardConfig {
  // static get defaultOptions() {
  //   dieHardLog(true,'DieHardConfig - defaultOptions')
  //   return {
  //     system: null,
  //     fudgeConfig: {
  //       maxFudgeAttemptsPerRoll: 150
  //     },
  //     activeFudges: {
  //       actorId: {
  //         whatId: {
  //
  //         }
  //       }
  //     },
  //     pendingFudge: {
  //       who: null,
  //       what: null,
  //       how: null
  //     }
  //   };
  // }

  constructor() {
    dieHardLog(true, 'DieHardConfig - constructor');

    // Setup default settings;

  }

  init() {
    dieHardLog(true, 'DieHardConfig - init');
  }

  getData() {

  }

  static registerSettings() {
    dieHardLog(true, 'DieHardConfig - registerSettings')
    let dieHardSettings = {
      system: null,
      debug: {
        allActors: true
      },
      fudgeConfig: {
        maxFudgeAttemptsPerRoll: 150
      },
      gmFudges: []
    };

    if (game.system.id == 'dnd5e') {
      dieHardLog(true, 'Configuring for dndn5e system')
      dieHardSettings.system = new DieHardDnd5e;

    } else {
      dieHardLog(true, 'Unsupport game system: ' + game.system.id)
    }

    game.settings.register('foundry-die-hard', 'dieHardSettings', {
      name: '',
      default: dieHardSettings,
      type: Object,
      scope: 'world',
      config: false,
    });
  }
}
import {dieHardLog} from "../lib/helpers.js";

export default class DieHardConfig {
  static get defaultOptions() {
    dieHardLog('DieHardConfig - defaultOptions', true)
    return {
      system: null,
      fudgeConfig: {
        maxFudgeAttemptsPerRoll: 150
      },
      activeFudges: {
        actorId: {
          whatId: {

          }
        }
      },
      pendingFudge: {
        who: null,
        what: null,
        how: null
      }
    };
  }

  constructor() {
    dieHardLog('DieHardConfig - constructor', true);

    // Setup default settings;

  }

  getData() {

  }
}
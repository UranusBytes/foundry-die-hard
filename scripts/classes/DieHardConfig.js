export default class DieHardConfig {
  static get defaultOptions() {
    return {
      fudgeConfig: {
        maxFudgeAttemptsPerRoll: 150
      },
      activeFudges: {

      },
      pendingFudge: {
        who: null,
        what: null,
        how: null
      }
    };
  }

  getData() {

  }
}
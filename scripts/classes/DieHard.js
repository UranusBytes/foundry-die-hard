import {dieHardLog} from "../lib/helpers.js";


export default class DieHard {

  constructor() {
    dieHardLog(true, 'DieHard - constructor');

    // Setup default settings;

  }

  init() {
    dieHardLog(true, 'DieHard - init');
  }

  renderFudgeIcon() {

  }
}
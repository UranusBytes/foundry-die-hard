import {dieHardLog} from "../lib/helpers.js";

export class DieHardFudgeDialog extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: true,
      popOut: true,
      editable: game.user.isGM,
      width: 500,
      template: 'modules/foundry-die-hard/templates/die-hard-fudge-config.html',
      id: 'die-hard-fudge-config',
      title: 'Die Hard Fudge Config',
    });
  }

  constructor() {
    dieHardLog('DieHardFudgeDialog - constructor')
    super();

  }

  getData() {
    dieHardLog('DieHardFudgeDialog - getData')
    let dialogData = {
      whoActors: game.diehard.system.getFudgeActors(),
      whatOptions: game.diehard.system.getFudgeWhatOptions()
    };
    console.log(dialogData);
    return dialogData;
  }

  getActiveFudge() {
    dieHardLog('DieHardFudgeDialog - getData')
    let activeFudge = {}

  }

  async _updateObject(event, formData) {
    dieHardLog('DieHardFudgeDialog : _updateObject')

    if (event.submitter?.name === 'save') {
      dieHardLog('DieHardFudgeDialog : Create fudge')

      game.dieHard.fudge.who = null;
      game.dieHard.fudge.what = null;
      game.dieHard.fudge.formula = null;
      return;
    }

    if (event.submitter?.name === 'cancel') {
      dieHardLog('DieHardFudgeDialog : Cancel fudge')

      game.dieHard.fudge.who = null;
      game.dieHard.fudge.what = null;
      game.dieHard.fudge.formula = null;
      return;
    }


    if(formData.draftFudgeWho != null) {
      game.dieHard.fudge.who = formData.draftFudgeWho;
    }
    if(formData.draftFudgeWhat != null) {
      game.dieHard.fudge.what = formData.draftFudgeWhat;
    }
    if(formData.draftFudgeFormula != null) {
      game.dieHard.fudge.formula = formData.draftFudgeFormula;
    }

  }
}
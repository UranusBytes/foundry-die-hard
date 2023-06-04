import {dieHardLog} from "../lib/helpers.js";
import DieHard, {DieHardSetting} from "./DieHard.js";

export default class DieHardFudgeDialog extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      closeOnSubmit: false,
      submitOnChange: false,
      submitOnClose: true,
      popOut: true,
      editable: game.user.isGM,
      width: 1000,
      template: 'modules/foundry-die-hard/templates/die-hard-fudge-config.html',
      id: 'die-hard-fudge-config',
      title: 'Die Hard Fudge Config',
    });
  }

  constructor() {
    dieHardLog(false, 'DieHardFudgeDialog.constructor')
    super();
    this.operator = null;
    this.operatorValue = null;
    Hooks.once('closeApplication', (app, html) => {
      if (app.id === 'die-hard-fudge-config') {
        game.dieHardSystem.refreshActiveFudgesIcon()
      }
    })
  }

  async getData() {
    dieHardLog(false, 'DieHardFudgeDialog - getData')
    let activeFudges = []
    let allFudges = game.dieHardSystem.getAllFudges()
    for (let fudgeType in allFudges) {
      dieHardLog(false, 'DieHardFudgeDialog - fudgeType', fudgeType, allFudges[fudgeType])
      for (let typeObject in allFudges[fudgeType]) {
        // dieHardLog(false, 'DieHardFudgeDialog - object fudges', typeObject, allFudges[fudgeType][typeObject])

        try {
          if (allFudges[fudgeType][typeObject].fudges.length > 0) {
            activeFudges = activeFudges.concat(allFudges[fudgeType][typeObject].fudges)
          }
        } catch (e) {}
      }
    }

    let dialogData = {
      whoGmOptions: game.dieHardSystem.getFudgeWhoGmOptions(),
      whoUserOptions: game.dieHardSystem.getFudgeWhoUserOptions(),
      //whoActorOptions: game.dieHardSystem.getFudgeWhoActorOptions(),
      whatOptions: game.dieHardSystem.getFudgeWhatOptions(),
      activeFudges: activeFudges
    };
    dieHardLog(false, 'DieHardFudgeDialog - dialogData', dialogData)
    return dialogData;
  }

  _uuidV4() {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
       (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
   }

   // Inspired by https://github.com/troygoode/fvtt-fudge/blob/main/modules/hooks.js
   _parseFormula(rawFormula) {
    const TARGET_FORMAT = /([^\d]*)[\s]*([\d]+)/;
    const match = rawFormula.match(TARGET_FORMAT);
    if (match == null) {
      return undefined;
    }
    const operator = match[1].trim();
    const operatorValue = parseInt(match[2].trim());
    switch (operator) {
      case "lt":
      case "<":
        return {
          how: '< ' + operatorValue,
          operator: "<",
          operatorValue: operatorValue
        };

      case "lte":
      case "<=":
        return {
          how: '<= ' + operatorValue,
          operator: "<=",
          operatorValue: operatorValue
        };
      case "gt":
      case ">":
        return {
          how: '> ' + operatorValue,
          operator: ">",
          operatorValue: operatorValue
        };
      case "gte":
      case ">=":
        return {
          how: '>= ' + operatorValue,
          operator: ">=",
          operatorValue: operatorValue
        };
      case "eq":
      case "=":
      case "==":
      case "===":
        return {
          how: '= ' + operatorValue,
          operator: "=",
          operatorValue: operatorValue
        };
      case "<>":
      case "!=":
      case "ne":
        return {
          how: '!= ' + operatorValue,
          operator: "!=",
          operatorValue: operatorValue
        };
      default:
        return undefined;
    };
  };

  _isFormError(event, formData) {
    let formError = false;
    let fudgeWhoHeader = document.getElementById('fudgeWhoHeader');
    let fudgeWhatHeader = document.getElementById('fudgeWhatHeader');
    let fudgeHowHeader = document.getElementById('fudgeHowHeader');

    if (formData.fudgeFormula !== '') {
      //validate the formula
      let parsedHow = this._parseFormula(formData.fudgeFormula)
      if (parsedHow === undefined) {
        document.getElementById('fudgeFormula').style.backgroundColor = "#ff6961";
        fudgeHowHeader.classList.remove("die-hard-form-error");
        // Hack from here to reset animation- https://css-tricks.com/restart-css-animation/
        fudgeHowHeader.offsetWidth;
        fudgeHowHeader.classList.add("die-hard-form-error");
        this.pendingHowOperator = null;
        this.pendingHowOperatorValue = null;
        formError = true;
      } else {
        document.getElementById('fudgeFormula').style.backgroundColor = "initial";
        fudgeHowHeader.classList.remove("die-hard-form-error");
        this.pendingHowOperator = parsedHow.operator;
        this.pendingHowOperatorValue = parsedHow.operatorValue;
        document.getElementById('fudgeFormula').value = parsedHow.how;
      }
    } else {
      document.getElementById('fudgeFormula').style.backgroundColor = "initial";
    }
    if (formData.fudgeTimes !== '') {
      //validate the fudge times
      if(! Number.isInteger(Number.parseInt(formData.fudgeTimes))) {
        document.getElementById('fudgeTimes').style.backgroundColor = "#ff6961";
        fudgeHowHeader.classList.remove("die-hard-form-error");
        // Hack from here to reset animation - https://css-tricks.com/restart-css-animation/
        fudgeHowHeader.offsetWidth;
        fudgeHowHeader.classList.add("die-hard-form-error");
        formError = true;
      }
    } else {
      document.getElementById('fudgeTimes').style.backgroundColor = "initial";
    }

    if (event.submitter?.name === 'create') {
      // Validate who and what is selected
      if (formData.fudgeWho == null || formData.fudgeWho.length === 0) {
        fudgeWhoHeader.classList.remove("die-hard-form-error");
        // Hack from here to reset animation - https://css-tricks.com/restart-css-animation/
        fudgeWhoHeader.offsetWidth;
        fudgeWhoHeader.classList.add("die-hard-form-error");
        formError = true;
      } else {
        fudgeWhoHeader.classList.remove("die-hard-form-error");
      }

      if (formData.fudgeWhat == null) {
        fudgeWhatHeader.classList.remove("die-hard-form-error");
        // Hack from here to reset animation - https://css-tricks.com/restart-css-animation/
        fudgeWhatHeader.offsetWidth;
        fudgeWhatHeader.classList.add("die-hard-form-error");
        formError = true;
      } else {
        fudgeWhatHeader.classList.remove("die-hard-form-error");
      }

      if (this.pendingHowOperator == null) {
        fudgeHowHeader.classList.remove("die-hard-form-error");
        // Hack from here to reset animation - https://css-tricks.com/restart-css-animation/
        fudgeHowHeader.offsetWidth;
        fudgeHowHeader.classList.add("die-hard-form-error");
        formError = true;
      } else {
        fudgeHowHeader.classList.remove("die-hard-form-error");
      }

    }
    return formError
  }

  _getWho(whoId) {
    dieHardLog(false, 'DieHardFudgeDialog : _getWho');
    let who = undefined
    try {
      who = game.users.get(whoId)
      dieHardLog(false, 'DieHardFudgeDialog : _getWho - who user', who);
      if (who) {
        dieHardLog(false, 'DieHardFudgeDialog : _getWho - returning user',);
        return who
      }
    }
    catch (e) {}
    try {
      who =  game.actors.get(whoId)
      dieHardLog(false, 'DieHardFudgeDialog : _getWho - who actor', who);
      if (who) {
        dieHardLog(false, 'DieHardFudgeDialog : _getWho - returning actor',);
        return who
      }
    }
    catch (e) {}
    dieHardLog(false, 'DieHardFudgeDialog : _getWho - Who not found - ', whoId);
  }

  async _updateObject(event, formData) {
    dieHardLog(false, 'DieHardFudgeDialog._updateObject')

    // If any form errors, stop
    if (this._isFormError(event, formData)) {
      return
    }

    if (event.submitter?.name === 'cancel') {
      dieHardLog(false, 'DieHardFudgeDialog : Cancel fudge')

      this.pendingHowOperator = null;
      this.pendingHowOperatorValue = null;

      this.close();
    } else if (event.submitter?.name === 'create') {
      dieHardLog(false, 'DieHardFudgeDialog._updateObject : Create Fudge');
      dieHardLog(false, 'DieHardFudgeDialog._updateObject : formData', formData);

      //Ugly hack for v10
      let formWho
      if (isNewerVersion(game.version, 9.9999)) {
        let whoOptions = ['hidden']
        for (const gm of game.dieHardSystem.getFudgeWhoGmOptions()) {
          dieHardLog(false, 'DieHardFudgeDialog._updateObject : gm', gm);
          whoOptions.push(gm.id)
        }
        for (const player of game.dieHardSystem.getFudgeWhoUserOptions()) {
          dieHardLog(false, 'DieHardFudgeDialog._updateObject : player', player);
          whoOptions.push(player.id)
        }
        formWho = []
        dieHardLog(false, 'DieHardFudgeDialog._updateObject : formData.fudgeWho', formData.fudgeWho);
        for (let index = 0; index < formData.fudgeWho.length; index++) {
          if (formData.fudgeWho[index]) {
            formWho.push(whoOptions[index])
          }
        }
      } else {
        formWho = formData.fudgeWho
      }
      dieHardLog(false, 'DieHardFudgeDialog._updateObject : formWho', formWho);
      //for (let whoIndex = 0; whoIndex < formData.fudgeWho.length; whoIndex++) {
      //  let whoId = formData.fudgeWho[whoIndex];

      for (let whoIndex = 0; whoIndex < formWho.length; whoIndex++) {
        let whoId = formWho[whoIndex];

        let who = this._getWho(whoId)

        dieHardLog(false, 'DieHardFudgeDialog : whoId', whoId);
        dieHardLog(false, 'DieHardFudgeDialog : who', who);
        let whoFudges = who.getFlag('foundry-die-hard', 'fudges')
        if (!Array.isArray(whoFudges)) {
          whoFudges = []
        }
        let whatOption = {}
        if (formData.fudgeWhat.slice(0,3) === 'raw') {
          whatOption = game.dieHardSystem.getFudgeWhatRawOptions().find(element => element.id === formData.fudgeWhat);
        } else  if (formData.fudgeWhat.slice(0,5) === 'total') {
          whatOption = game.dieHardSystem.getFudgeWhatTotalOptions().find(element => element.id === formData.fudgeWhat);
        } else {
          whatOption = game.dieHardSystem.getFudgeWhatOptions().find(element => element.id === formData.fudgeWhat);
        }

        let fudgeTimes = 1;
        /*
        if (Number.isInteger(Number.parseInt(formData.fudgeTimes))) {
          fudgeTimes = Number.parseInt(formData.fudgeTimes);
        }
        */

        try {
          for (let loopIndex = 0; loopIndex < fudgeTimes; loopIndex++) {
            whoFudges.push({
                id: this._uuidV4(),
                whoId: who.id,
                whoName: who.name,
                whatId: whatOption.id,
                whatName: whatOption.name,
                statusActive: true,
                statusEndless: false,
                howFormula: formData.fudgeFormula,
                operator: this.pendingHowOperator,
                operatorValue: this.pendingHowOperatorValue
              }
            )
          }
        }
        catch (e) {
          console.log(e)
        }

        dieHardLog(false, 'DieHardFudgeDialog : Set Fudge', whoFudges);
        await who.setFlag('foundry-die-hard', 'fudges', whoFudges);
        this.pendingHowOperator = null;
        this.pendingHowOperatorValue = null;
      }
      this.render(true)
    }
  }

  _deleteFudge(event) {
    dieHardLog(false, 'DieHardFudgeDialog : deleteFudge', event)
    dieHardLog(false, 'DieHardFudgeDialog : event.currentTarget.dataset.actor', event.currentTarget.dataset.actor)

    event.preventDefault();

    let whoId = event.currentTarget.dataset.who;
    let fudgeId = event.currentTarget.dataset.fudge
    let who = this._getWho(whoId)
    let whoFudges = who.getFlag('foundry-die-hard', 'fudges')
    let fudgeIndex = whoFudges.findIndex(element => { return element.id === fudgeId;});
    whoFudges.splice(fudgeIndex,1)
    who.setFlag('foundry-die-hard', 'fudges', whoFudges);
    this.render()
  }

  _toggleFudge(event) {
    dieHardLog(false, 'DieHardFudgeDialog : _toggleFudge', event)
    dieHardLog(false, 'DieHardFudgeDialog : _toggleFudge dataset', event.currentTarget.dataset)

    event.preventDefault();
    let whoId = event.currentTarget.dataset.who;
    let fudgeId = event.currentTarget.dataset.fudge;
    let who = this._getWho(whoId)
    let whoFudges = who.getFlag('foundry-die-hard', 'fudges')
    let fudgeIndex = whoFudges.findIndex(element => { return element.id === fudgeId;});
    whoFudges[fudgeIndex].statusActive = !whoFudges[fudgeIndex].statusActive
    who.setFlag('foundry-die-hard', 'fudges', whoFudges);
    this.render()
  }

  _toggleEndlessFudge(event) {
    dieHardLog(false, 'DieHardFudgeDialog : _toggleEndlessFudge', event)
    dieHardLog(false, 'DieHardFudgeDialog : _toggleEndlessFudge dataset', event.currentTarget.dataset)

    event.preventDefault();
    let whoId = event.currentTarget.dataset.who;
    let fudgeId = event.currentTarget.dataset.fudge;
    let who = this._getWho(whoId)
    let whoFudges = who.getFlag('foundry-die-hard', 'fudges')
    let fudgeIndex = whoFudges.findIndex(element => { return element.id === fudgeId;});
    whoFudges[fudgeIndex].statusEndless = !whoFudges[fudgeIndex].statusEndless
    who.setFlag('foundry-die-hard', 'fudges', whoFudges);
    this.render()
  }

  _helpFudgeFormula(event) {
    let content =
    Dialog.prompt({
     title: "Fudge Help - Formula",
     content: "<p>Operators:</p><ul>" +
       "<li>&gt;</li>" +
       "<li>&lt;</li>" +
       "<li>&gt;=</li>" +
       "<li>&lt;=</li>" +
       "<li>!=</li>" +
       "<li>&lt;=</li>" +
    "</ul>",
      callback: (ev) => {
        return;
      }
    })
  }

  _helpFudgeTimes(event) {
    Dialog.prompt({
     title: "Fudge Help - Times",
     content: "<p>The number of times the fudge should be applied (Default: 1)</p>",
      callback: (ev) => {
        return;
      }
    })
  }

  activateListeners(html) {
    dieHardLog(false, 'DieHardFudgeDialog.activateListeners')
    super.activateListeners(html);
    html.find(".delete-fudge")?.on('click', this._deleteFudge.bind(this));
    html.find(".toggle-fudge")?.on('click', this._toggleFudge.bind(this));
    html.find(".endless-fudge")?.on('click', this._toggleEndlessFudge.bind(this));
    html.find(".fudge-help-formula")?.on('click', this._helpFudgeFormula.bind(this));
    html.find(".fudge-help-times")?.on('click', this._helpFudgeTimes.bind(this));
  }
/*
  _onSubmit(event, __namedParameters) {
    dieHardLog(false, 'DieHardFudgeDialog._onSubmit', event, __namedParameters)
    // Hack for v10
    if (event.path.length > 0) {
      super._onSubmit(event, __namedParameters)
    }
  }
  */
}


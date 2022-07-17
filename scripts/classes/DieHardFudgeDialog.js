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
      width: 1000,
      template: 'modules/foundry-die-hard/templates/die-hard-fudge-config.html',
      id: 'die-hard-fudge-config',
      title: 'Die Hard Fudge Config',
    });
  }

  constructor() {
    dieHardLog(false, 'DieHardFudgeDialog - constructor')
    super();
    this.operator = null;
    this.operatorValue = null;
    Hooks.once('closeApplication', (app, html) => {
      if (app.id === 'die-hard-fudge-config') {
        game.settings.get('foundry-die-hard', 'dieHardSettings').system.refreshActiveFudgesIcon()
      }
    })
  }

  async getData() {
    dieHardLog(false, 'DieHardFudgeDialog - getData')
    let activeFudges = []
    let allFudges = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getAllFudges()
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
      whoGmOptions: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhoGmOptions(),
      whoUserOptions: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhoUserOptions(),
      whoActorOptions: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhoActorOptions(),
      whatOptions: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhatOptions(),
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
    try {
      return game.users.get(whoId)
    }
    catch (e) {}
    try {
      return game.actors.get(whoId)
    }
    catch (e) {}
    dieHardLog(true, 'DieHardFudgeDialog : Who not found - ', whoId);
  }

  async _updateObject(event, formData) {
    dieHardLog(false, 'DieHardFudgeDialog : _updateObject')

    // If any form errors, stop
    if (this._isFormError(event, formData)) {
      return
    }

    if (event.submitter?.name === 'create') {
      dieHardLog(false, 'DieHardFudgeDialog : Create Fudge');

      for (let whoIndex = 0; whoIndex < formData.fudgeWho.length; whoIndex++) {
        let whoId = formData.fudgeWho[whoIndex];
        let who = this._getWho(whoId)

        dieHardLog(false, 'DieHardFudgeDialog : who', who);
        let whoFudges = who.getFlag('foundry-die-hard', 'fudges')
        if (!Array.isArray(whoFudges)) {
          whoFudges = []
        }

        let whatOption = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhatOptions().find(element => element.id === formData.fudgeWhat);

        let fudgeTimes = 1;
        if (Number.isInteger(Number.parseInt(formData.fudgeTimes))) {
          fudgeTimes = Number.parseInt(formData.fudgeTimes);
        }

        try {
          for (let loopIndex = 0; loopIndex < fudgeTimes; loopIndex++) {
            whoFudges.push({
                id: this._uuidV4(),
                whoId: who.id,
                whoName: who.name,
                whatId: whatOption.id,
                whatName: whatOption.name,
                statusActive: true,
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
        who.setFlag('foundry-die-hard', 'fudges', whoFudges);
        this.pendingHowOperator = null;
        this.pendingHowOperatorValue = null;
      }
      this.render(true)
    } else if (event.submitter?.name === 'cancel') {
      dieHardLog(false, 'DieHardFudgeDialog : Cancel fudge')

      this.pendingHowOperator = null;
      this.pendingHowOperatorValue = null;

      this.close();
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

  _helpFudgeFormula(event) {
    Dialog.prompt({
     title: "Fudge Help - Formula",
     content: "<p>Operators:</p>" +
       "<ul><li>=</li><li>=</li><li>&gt;</li><li>&lt;</li></ul>",
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
    dieHardLog(false, 'DieHardFudgeDialog : activateListeners')
    super.activateListeners(html);
    html.find(".delete-fudge").on('click', this._deleteFudge.bind(this));
    html.find(".toggle-fudge").on('click', this._toggleFudge.bind(this));
    html.find(".fudge-help-formula").on('click', this._helpFudgeFormula.bind(this));
    html.find(".fudge-help-times").on('click', this._helpFudgeTimes.bind(this));
  }
}


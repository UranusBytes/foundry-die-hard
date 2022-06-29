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

  getData() {
    dieHardLog(false, 'DieHardFudgeDialog - getData')
    let dialogData = {
      whoActors: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getActors(),
      whatOptions: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhatOptions(),
      actorFudges: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getAllFudges(),
    };
    return dialogData;
  }

  _uuidv4() {
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

  async _updateObject(event, formData) {
    dieHardLog(false, 'DieHardFudgeDialog : _updateObject')

    // If any form errors, stop
    if (this._isFormError(event, formData)) {
      return
    }

    if (event.submitter?.name === 'create') {
      dieHardLog(false, 'DieHardFudgeDialog : Create Fudge');

      for (let actorIndex = 0; actorIndex < formData.fudgeWho.length; actorIndex++) {
        let actorId = formData.fudgeWho[actorIndex];
        let actorName = "";
        let actorFudges = null;
        if (actorId === 'gameMaster') {
          actorFudges = game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges;
          actorName = "Game Master"
        } else {
          let actor = game.actors.get(actorId);
          actorFudges = actor.getFlag('foundry-die-hard', 'actorFudges');
          actorName = actor.name
        }

        let whatOptions = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhatOptions();
        if (typeof actorFudges === 'undefined') {
          actorFudges = [];
        }
        let fudgeTimes = 1;
        if (Number.isInteger(Number.parseInt(formData.fudgeTimes))) {
          fudgeTimes = Number.parseInt(formData.fudgeTimes);
        }

        let whatName = whatOptions.find(element => element.id === formData.fudgeWhat).name;
        for (let loopIndex = 0; loopIndex < fudgeTimes; loopIndex++) {
          actorFudges.push({
              id: this._uuidv4(),
              who: actorId,
              whoName: actorName,
              what: formData.fudgeWhat,
              whatName: whatName,
              statusActive: true,
              how: formData.fudgeFormula,
              operator: this.pendingHowOperator,
              operatorValue: this.pendingHowOperatorValue
            }
          )
        }
        if (actorId === 'gameMaster') {
          game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges = actorFudges;
        } else {
          game.actors.get(actorId).setFlag('foundry-die-hard', 'actorFudges', actorFudges);
        }
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

    event.preventDefault();
    let actorId = event.currentTarget.dataset.actor;
    let actorFudges = null
    if (actorId === 'gameMaster') {
      actorFudges = game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges;
    } else {
      actorFudges = game.actors.get(actorId).getFlag('foundry-die-hard', 'actorFudges');
    }
    let fudgeIndex = actorFudges.findIndex(element => { return element.id === event.currentTarget.dataset.fudge;});
    let deletedFudge = actorFudges.splice(fudgeIndex,1)
    if (actorId === 'gameMaster') {
      game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges = actorFudges
    } else {
      game.actors.get(event.currentTarget.dataset.actor).setFlag('foundry-die-hard', 'actorFudges', actorFudges);
    }
    this.render()
  }

  _toggleFudge(event) {
    dieHardLog(false, 'DieHardFudgeDialog : _toggleFudge', event)
    dieHardLog(false, 'DieHardFudgeDialog : _toggleFudge dataset', event.currentTarget.dataset)

    event.preventDefault();
    let actorId = event.currentTarget.dataset.actor;
    let actorFudges = null
    if (actorId === 'gameMaster') {
      actorFudges = game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges;
    } else {
      actorFudges = game.actors.get(actorId).getFlag('foundry-die-hard', 'actorFudges');
    }
    let fudgeIndex = actorFudges.findIndex(element => { return element.id === event.currentTarget.dataset.fudge;});
    actorFudges[fudgeIndex].statusActive = !actorFudges[fudgeIndex].statusActive
    if (actorId === 'gameMaster') {
      game.settings.get('foundry-die-hard', 'dieHardSettings').gmFudges = actorFudges
    } else {
      game.actors.get(event.currentTarget.dataset.actor).setFlag('foundry-die-hard', 'actorFudges', actorFudges);
    }
    this.render()
  }

  _helpFudge(event) {
    Dialog.prompt({
     title: "Fudge Help",
     content: "<p>Operators:</p>" +
       "<ul><li>=</li><li>=</li><li>&gt;</li><li>&lt;</li></ul>",
      callback: (ev) => {
        this.close();
      }
    })
  }

  activateListeners(html) {
    dieHardLog(false, 'DieHardFudgeDialog : activateListeners')
    super.activateListeners(html);
    html.find(".delete-fudge").on('click', this._deleteFudge.bind(this));
    html.find(".toggle-fudge").on('click', this._toggleFudge.bind(this));
    html.find(".fudge-help").on('click', this._helpFudge.bind(this));
  }
}


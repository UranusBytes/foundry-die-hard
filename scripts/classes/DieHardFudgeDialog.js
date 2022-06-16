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
    dieHardLog(false, 'DieHardFudgeDialog - constructor')
    super();
    this.pendingWho = null;
    this.pendingWhat = null;
    this.pendingHow = null;
    this.operator = null;
    this.operatorValue = null;
  }

  getData() {
    dieHardLog(false, 'DieHardFudgeDialog - getData')
    let dialogData = {
      whoActors: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeActors(),
      whatOptions: game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhatOptions(),
      activeFudge: this.getAllActiveFudges()

    };
    return dialogData;
  }

  getAllActiveFudges() {
    let activeFudges = [];
    let whatOptions = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeWhatOptions()
    let actors = game.settings.get('foundry-die-hard', 'dieHardSettings').system.getFudgeActors();
    for (let actorIndex = 0; actorIndex < actors.length; actorIndex++) {
      try {
        let actor = actors[actorIndex];
        let actorFudges = game.actors.get(actor.id).getFlag('foundry-die-hard', 'activeFudges');
        for (let fudgeIndex = 0; fudgeIndex < actorFudges.length; fudgeIndex++) {
          activeFudges.push({
            id: actorFudges[fudgeIndex].id,
            who: actor.id,
            whoName: actor.name,
            what: actorFudges[fudgeIndex].what,
            whatName: whatOptions.find(element => element.id === actorFudges[fudgeIndex].what).name,
            how: actorFudges[fudgeIndex].how
          })
        }
      }
      catch (e) {}
    }
    dieHardLog(false, 'DieHardFudgeDialog - getAllActiveFudges', activeFudges)
    return activeFudges;
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


  async _updateObject(event, formData) {
    dieHardLog(false, 'DieHardFudgeDialog : _updateObject')

    if (formData.draftFudgeWho != null) {
      this.pendingWho = formData.draftFudgeWho;
    }
    if (formData.draftFudgeWhat != null) {
      this.pendingWhat = formData.draftFudgeWhat;
    }
    if (formData.draftFudgeFormula != null) {
      //validate the formula
      this.pendingHow = formData.draftFudgeFormula;
      let parsedHow = this._parseFormula(formData.draftFudgeFormula)
      if (formData.draftFudgeFormula === '') {
        // Do nothing
      }
      else if (parsedHow === undefined) {
        document.getElementById('draftFudgeFormula').style.backgroundColor = "#ff6961"
        return;
      } else {
        document.getElementById('draftFudgeFormula').style.backgroundColor = ""
        this.pendingHow = parsedHow.how;
        this.pendingHowOperator = parsedHow.operator;
        this.pendingHowOperatorValue = parsedHow.operatorValue;
        document.getElementById('draftFudgeFormula').value = this.pendingHow;
      }
    }

    if (event.submitter?.name === 'create') {
      dieHardLog(false, 'DieHardFudgeDialog : Create fudge for ' + this.pendingWho)

      let actorFudges = game.actors.get(this.pendingWho).getFlag('foundry-die-hard', 'activeFudges');
      if (typeof actorFudges === 'undefined') {
        actorFudges = [];
      }
      actorFudges.push({
          id: this._uuidv4(),
          what: this.pendingWhat,
          how: this.pendingHow,
          operator: this.pendingHowOperator,
          operatorValue: this.pendingHowOperatorValue
        }
      )

      game.actors.get(this.pendingWho).setFlag('foundry-die-hard', 'activeFudges', actorFudges);

      this.pendingWho = null;
      this.pendingWhat = null;
      this.pendingHow = null;
      this.operator = null;
      this.operatorValue = null;

      formData.draftFudgeWho = null;
      formData.draftFudgeWhat = null;
      formData.draftFudgeFormula = null;
      console.log('activeFudges', this.getAllActiveFudges())
      this.render(true)
      return;
    }

    if (event.submitter?.name === 'cancel') {
      dieHardLog(false, 'DieHardFudgeDialog : Cancel fudge')

      this.pendingWho = null;
      this.pendingWhat = null;
      this.pendingHow = null;
      this.operator = null;
      this.operatorValue = null;
      this.close();
      return;
    }
  }

  _deleteFudge(event) {
    dieHardLog(false, 'DieHardFudgeDialog : deleteFudge', event)

    event.preventDefault();
    let actorFudges = game.actors.get(event.currentTarget.dataset.actor).getFlag('foundry-die-hard', 'activeFudges');
    let fudgeIndex = actorFudges.findIndex(element => { return element.id === event.currentTarget.dataset.fudge;});
    let deletedFudge = actorFudges.splice(fudgeIndex,1)
    game.actors.get(event.currentTarget.dataset.actor).setFlag('foundry-die-hard', 'activeFudges', actorFudges);
    this.render()
  }

  _helpFudge(event) {
    // ToDo: build this out
  }
  activateListeners(html) {
    dieHardLog(false, 'DieHardFudgeDialog : activateListeners')
    super.activateListeners(html);
    html.find(".delete-fudge").on('click', this._deleteFudge.bind(this));
    html.find(".fudge-help").on('click', this._helpFudge.bind(this));
  }
}


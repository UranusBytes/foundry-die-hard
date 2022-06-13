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

  // async _renderActiveFudge() {
  //   dieHardLog(false, 'DieHardFudgeDialog - _renderActiveFudge')
  //   renderTemplate('./modules/foundry-die-hard/templates/die-hard-fudge-config-active.html', {activeFudge: this.getAllActiveFudges()}).then(this.updateActiveFudge);
  // }

  // updateActiveFudge(renderedContent) {
  //   dieHardLog(false, 'DieHardFudgeDialog - updateActiveFudge')
  //   $('#activeFudges').html(renderedContent)
  //   this._render();
  // }

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

  async _updateObject(event, formData) {
    dieHardLog(false, 'DieHardFudgeDialog : _updateObject')

    console.log('pendingWho', formData)
    if (event.submitter?.name === 'create') {
      dieHardLog(false, 'DieHardFudgeDialog : Create fudge for ' + this.pendingWho)

      let actorFudges = game.actors.get(this.pendingWho).getFlag('foundry-die-hard', 'activeFudges');
      if (typeof actorFudges === 'undefined') {
        actorFudges = [];
      }
      actorFudges.push({
          id: this._uuidv4(),
          what: this.pendingWhat,
          how: this.pendingHow
        }
      )

      game.actors.get(this.pendingWho).setFlag('foundry-die-hard', 'activeFudges', actorFudges);

      this.pendingWho = null;
      this.pendingWhat = null;
      this.pendingHow = null;

      formData.draftFudgeWho = null;
      formData.draftFudgeWhat = null;
      formData.draftFudgeFormula = null;
      console.log('activeFudges', this.getAllActiveFudges())
      this.render(true)
      return;
    }

    //this._renderActiveFudge()

    if (event.submitter?.name === 'cancel') {
      dieHardLog(false, 'DieHardFudgeDialog : Cancel fudge')

      this.pendingWho = null;
      this.pendingWhat = null;
      this.pendingHow = null;
      this.close();
      return;
    }


    if (formData.draftFudgeWho != null) {
      this.pendingWho = formData.draftFudgeWho;
    }
    if (formData.draftFudgeWhat != null) {
      this.pendingWhat = formData.draftFudgeWhat;
    }
    if (formData.draftFudgeFormula != null) {
      this.pendingHow = formData.draftFudgeFormula;
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

  activateListeners(html) {
    dieHardLog(false, 'DieHardFudgeDialog : activateListeners')
    super.activateListeners(html);
    html.find(".delete-fudge").on('click', this._deleteFudge.bind(this));
  }
}


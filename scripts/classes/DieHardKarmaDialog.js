import {dieHardLog} from "../lib/helpers.js";
import DieHard, {DieHardSetting} from "./DieHard.js";

export default class DieHardKarmaDialog extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: true,
      popOut: true,
      editable: game.user.isGM,
      width: 500,
      template: 'modules/foundry-die-hard/templates/die-hard-karma-config.html',
      id: 'die-hard-karma-config',
      title: 'Die Hard Karma Config',
    });
  }

  constructor() {
    dieHardLog(false, 'DieHardKarmaDialog.constructor')
    super();
    Hooks.once('closeApplication', (app, html) => {
      if (app.id === 'die-hard-karma-config') {
        DieHard.refreshDieHardIcons()
      }
    })
  }

  async getData() {
    dieHardLog(false, 'DieHardKarmaDialog.getData')

    let dialogData = {
      simpleKarma: DieHardSetting('simpleKarmaSettings'),
      simpleKarmaPlayerStats: this.getkarmaPlayerStats('simpleKarma'),
      avgKarma: DieHardSetting('avgKarmaSettings'),
      avgKarmaPlayerStats: this.getkarmaPlayerStats('avgKarma')
    };
    dieHardLog(false, 'DieHardKarmaDialog.getData', dialogData)
    return dialogData;
  }

  getkarmaPlayerStats(karmaType) {
    let playerStats = []
    for (let userId of game.users.keys()) {
      let curUser = game.users.get(userId);
      dieHardLog(false, 'DieHardKarmaDialog.getkarmaPlayerStats - game.users[user]', curUser)
      let curUserStats = curUser.getFlag('foundry-die-hard', karmaType)
      if (!Array.isArray(curUserStats)) {
        curUserStats = []
      }
      let curUserAvg = Math.round((curUserStats.reduce((a, b) => a + b, 0) / curUserStats.length) * 10) /10
      if (isNaN(curUserAvg)) {
        curUserAvg = 0
      }
      playerStats.push({
        name: curUser.name,
        stats: curUserStats,
        statsString: curUserStats.join(', '),
        avg: curUserAvg
      })
    }
    return playerStats
  }

  async _updateObject(event, formData) {
    dieHardLog(false, 'DieHardKarmaDialog._updateObject')

    if (formData.karmaSimpleEnabled && formData.karmaAvgEnabled) {
      document.getElementById('karmaWarningHeader').style.display = '';
      document.getElementById('karmaWarningBody').style.display = '';
    } else {
      document.getElementById('karmaWarningHeader').style.display = 'none';
      document.getElementById('karmaWarningBody').style.display = 'none';
    }

    let originalKarmaSimpleSettings = game.settings.get('foundry-die-hard', 'simpleKarmaSettings')
    let karmaSimpleSettings = {
      enabled: formData.karmaSimpleEnabled,
      history: formData.karmaSimpleHistory,
      threshold: formData.karmaSimpleThreshold,
      floor: formData.karmaSimpleFloor
    }
    await game.settings.set('foundry-die-hard', 'simpleKarmaSettings', karmaSimpleSettings)
    if (formData.karmaSimpleEnabled) {
      document.getElementById('divKarmaSimpleHistory').style.display = '';
      document.getElementById('divKarmaSimpleThreshold').style.display = '';
      document.getElementById('divKarmaSimpleFloor').style.display = '';
      document.getElementById('divKarmaSimplePlayerStats').style.display = '';
    } else {
      document.getElementById('divKarmaSimpleHistory').style.display = 'none';
      document.getElementById('divKarmaSimpleThreshold').style.display = 'none';
      document.getElementById('divKarmaSimpleFloor').style.display = 'none';
      document.getElementById('divKarmaSimplePlayerStats').style.display = 'none';
    }

    let originalKarmaAvgSettings = game.settings.get('foundry-die-hard', 'avgKarmaSettings')
    let karmaAvgSettings = {
      enabled: formData.karmaAvgEnabled,
      history: formData.karmaAvgHistory,
      threshold: formData.karmaAvgThreshold,
      nudge: formData.karmaAvgNudge
    }
    document.getElementById('karmaAvgThresholdMore').innerText = formData.karmaAvgThreshold;
    await game.settings.set('foundry-die-hard', 'avgKarmaSettings', karmaAvgSettings)
    if (formData.karmaAvgEnabled) {
      document.getElementById('divKarmaAvgHistory').style.display = '';
      document.getElementById('divKarmaAvgThreshold').style.display = '';
      document.getElementById('divKarmaAvgNudge').style.display = '';
      document.getElementById('divKarmaAvgPlayerStats').style.display = '';
    } else {
      document.getElementById('divKarmaAvgHistory').style.display = 'none';
      document.getElementById('divKarmaAvgThreshold').style.display = 'none';
      document.getElementById('divKarmaAvgNudge').style.display = 'none';
      document.getElementById('divKarmaAvgPlayerStats').style.display = 'none';
    }

    if (originalKarmaSimpleSettings.enabled !== formData.karmaSimpleEnabled || originalKarmaAvgSettings.enabled !== formData.karmaAvgEnabled){
      this.setPosition({height: 'auto'})
    }
  }
}


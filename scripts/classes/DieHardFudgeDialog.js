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

  getData() {
    let whoActors = []
    console.log('Actor IDs')
    console.log(game.actors.keys())
    for (let actorId of game.actors.keys()) {
      console.log('actorID: ' + actorId)
      let curActor = game.actors.get(actorId);
      if(curActor.data.type === 'character') {
        whoActors.push({key: actorId, name: curActor.name})
      }
    }
    console.log('whoActors')
    console.log(whoActors)
    return {
        whoActors: whoActors
      };
  }

  async _updateObject(event, formData) {
    console.log(formData);
    if(formData.draftFudgeWho != null) {
      game.dieHard.fudge.who = formData.draftFudgeWho;
    }
    if(formData.draftFudgeWhat != null) {
      game.dieHard.fudge.what = formData.draftFudgeWhat;
    }
    if(formData.draftFudgeFormula != null) {
      game.dieHard.fudge.formula = formData.draftFudgeFormula;
    }
    //Object.entries(formData).forEach(async ([key, val]) => {
    //   // If setting is an opacity slider, convert from 1-100 to 0-1
    //   if (['gmAlpha', 'playerAlpha', 'vThreshold'].includes(key)) val /= 100;
    //   // If setting is a color value, convert webcolor to hex before saving
    //   if (['gmTint', 'playerTint'].includes(key)) val = webToHex(val);
    //   // Save settings to scene
    //   await canvas.simplefog.setSetting(key, val);
    //   // If saveDefaults button clicked, also save to user's defaults
    //   if (event.submitter?.name === 'saveDefaults') {
    //     canvas.simplefog.setUserSetting(key, val);
    //   }
    // });

    // If save button was clicked, close app
    //     if (event.submitter?.name === 'submit') {
    //       Object.values(ui.windows).forEach((val) => {
    //         if (val.id === 'simplefog-scene-config') val.close();
    //       });
    //     }
    //   }
    // }
  }
}
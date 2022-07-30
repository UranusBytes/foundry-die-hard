import {dieHardLog} from "../lib/helpers.js";
/*
 * Provides a mechanism to send whisper to GM when new version installed.
 */
export default class DieHardVersionNotification {
  static checkVersion() {
    let functionLogName = 'DieHardVersionNotification.checkVersion'
    let notificationVersion = 2
    if (game.user.isGM && game.user.getFlag('foundry-die-hard', 'versionNotification') !== notificationVersion) {
      dieHardLog(false, functionLogName + ' - Send version notification');
      let commonFooter = "<p>To report problems:<ul><li>open a GitHub issue <a href='https://github.com/UranusBytes/foundry-die-hard/issues' target='_blank'>here</a></li><li>send a message on Discord to <a href='https://discordapp.com/users/530108795796455437' target='_blank'>Glutious#7241</a></li></ul></p>"
      let versionMessage = {
        1: "<b>Die Hard v0.0.5</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Initial release supporting PF2e system</li>" +
          "<li>Right-click of fudge icon to globally pause/disable all fudges</li>" +
          "<li>Config dialog UI improvements</li>" +
          "<li>This super nifty notification!</li>" +
          "</ul>",
        2: "<b>Die Hard v0.0.6</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Fixes for PF2e strike attack fudges</li>" +
          "<li>Differentiate raw die rolls vs roll totals</li>" +
          "</ul>",
      }
      let finalMessage = ""
      let startVersion = game.user.getFlag('foundry-die-hard', 'versionNotification')
      dieHardLog(false, functionLogName + ' - startVersion', startVersion, isNaN(startVersion));
      if (!isNaN(startVersion)) {
        startVersion = 1
      }
      for (let version = startVersion; version <= notificationVersion; version++) {
        finalMessage += versionMessage[version]
      }
      finalMessage += commonFooter

      // GM has never seen current version message
      game.settings.get('foundry-die-hard', 'dieHardSettings').system.dmToGm(finalMessage);

      // Update the saved version
      game.user.setFlag('foundry-die-hard', 'versionNotification', notificationVersion)
    }
  }
}

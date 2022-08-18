import {dieHardLog} from "../lib/helpers.js";
import DieHard from "./DieHard.js";
/*
 * Provides a mechanism to send whisper to GM when new version installed.
 */
export default class DieHardVersionNotification {
  static checkVersion() {
    let functionLogName = 'DieHardVersionNotification.checkVersion'
    let notificationVersion = 7

    // First time module is being loaded
    if (game.user.isGM && game.user.getFlag('foundry-die-hard', 'versionNotification') !== notificationVersion) {
      dieHardLog(false, functionLogName + ' - Send version notification', game.user.getFlag('foundry-die-hard', 'versionNotification'));
      let commonHeader = "<p><b>Die Hard Module</b></p>"
      let commonFooter = "<p>To report problems:<ul><li>open a GitHub issue <a href='https://github.com/UranusBytes/foundry-die-hard/issues' target='_blank'>here</a></li><li>send a message on Discord to <a href='https://discordapp.com/users/530108795796455437' target='_blank'>Glutious#7241</a></li></ul></p>"
      let versionMessage = {
        1: "<b>v0.0.5</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Initial release supporting PF2e system</li>" +
          "<li>Right-click of fudge icon to globally pause/disable all fudges</li>" +
          "<li>Config dialog UI improvements</li>" +
          "<li>This super nifty notification!</li>" +
          "</ul>",
        2: "<b>v0.0.6</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Fixes for PF2e strike attack fudges</li>" +
          "<li>Differentiate raw die rolls vs roll totals</li>" +
          "</ul>",
        3: "<b>v0.0.7</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Remove 'Times' functionality from fudge</li>" +
          "<li>Fix for raw die fudge still happening when global disabled</li>" +
          "<li>Issue where disabled fudge before enabled would prevent selection of enabled</li>" +
          "<li>Change fudge icon behavior for global disabled</li>" +
          "<li>Fudge icon adjustments #14</li>" +
          "<li>Fudge config adjustments #15</li>" +
          "<li>Fix fudge whispers going to more than GM #16</li>" +
          "</ul>",
        4: "<b>v0.0.9</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Simple and Avg Karma</li>" +
          "<li>Lots of refactoring to cleanup code</li>" +
          "</ul>",
        5: "<b>v0.0.10</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Fix for version notification</li>" +
          "<li>Fix for making DM not visible to users #22</li>" +
          "</ul>",
        6: "<b>v0.0.11</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>Fixes for global disables</li>" +
          "<li>Improvements to VersionNotification</li>" +
          "<li>Move lots of debug logging to using the debug flag</li>" +
          "<li>Adjust Simple and Avg Karma default to disabled</li>" +
          "<li>Adjust Simple and Avg Karma so they can both influence the die roll</li>" +
          "<li>Improvements to Fudge Icon #27</li>" +
          "<li>Add 'warning' to Karma dialog for conflict issues</li>" +
          "<li>Add Cumulative option to Karma dialog</li>" +
          "<li>Add Karma Cumulative logic</li>" +
          "<li>Add enable/disable coloring of Karma button</li>" +
          "<li>Add notification when debugDieResult changes die result</li>" +
          "<li>Fix for version notification</li>" +
          "</ul>",
        7: "<b>v0.1.0</b><p>" +
            "This version includes the following major changes:</p><ul>" +
          "<li>* Fix: Catch if user (GM or player) doesn't have any fudges yet</li>" +
          "<li>* Fix: Initial fudge definition not rendering in dialog #26</li>" +
          "<li>* Fix: DND5e skill roll mis-categorized</li>" +
          "<li>* Fix: Avg Karma History not showing</li>" +
          "<li>* Improve documentation</li>" +
          "</ul>"
      }
      let finalMessage = ""
      let startVersion = game.user.getFlag('foundry-die-hard', 'versionNotification')
      dieHardLog(false, functionLogName + ' - startVersion', startVersion, isNaN(startVersion));
      if (!isNaN(startVersion)) {
        startVersion = notificationVersion
      }
      for (let version = startVersion; version <= notificationVersion; version++) {
        finalMessage += versionMessage[version]
      }

      // GM has never seen current version message
      DieHard.dmToGm(commonHeader + finalMessage + commonFooter);

      // Update the saved version
      game.user.setFlag('foundry-die-hard', 'versionNotification', notificationVersion)
    }
  }
}

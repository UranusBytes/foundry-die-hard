# Die Hard Changelog

## v0.0.2-ALPHA.0
Jun 16, 2022
* Initial release of Fudge for DND 5e 

## v0.0.3-ALPHA.0
Jun 25, 2022
* Major refactor of system code to support flexibility
* Adjust dialog to support new UI/UX
* TOTALLY BROKEN fudging of rolls

## v0.0.4-ALPHA.0
Jul 23, 2022
* Refactor of all


## v0.0.5-BETA.0
Jul 30, 2022
* Initial release supporting PF2e system
* Right-click of fudge icon to globally pause/disable all fudges
* Config dialog UI improvements
* Notification to DMs when new version installed/upgraded

## v0.0.6
Jul 30, 2022
* Fix attack/strike roll fudges for PF2e
* Add concept of "Total Roll" (including modifiers) vs "Raw Die Roll" (only the die)

## v0.0.7
Aug 1, 2022
* Remove 'Times' functionality from fudge
* Fix for raw die fudge still happening when global disabled
* Issue where disabled fudge before enabled would prevent selection of enabled
* Change fudge icon behavior for global disabled
* Fudge icon adjustments #14
* Fudge config adjustments #15
* Fix fudge whispers going to more than GM #16

## v0.0.8
Aug 2, 2022
* Fix issue with fudges dialog from Times removal

## v0.0.9
Aug 7, 2022
* Lots of refactoring to cleanup code
* Remove fudges for actors
* Simple and Avg Karma

## v0.0.10
Aug 10, 2022
* Fixes for disabling fudge 
* Fix for version notification
* Fix for making DM not visible to users #22

## v0.0.11
Aug 17, 2022
* Fixes for global disables
* Improvements to VersionNotification
* Move lots of debug logging to using the debug flag
* Adjust Simple and Avg Karma default to disabled
* Adjust Simple and Avg Karma so they can both influence the die roll
* Improvements to Fudge Icon #27
* Add "warning" to Karma dialog for conflict issues
* Add Cumulative option to Karma dialog
* Add Karma Cumulative logic
* Add enable/disable coloring of Karma button
* Add notification when debugDieResult changes die result

## v0.1.0
Aug 18, 2022
* Fix: Catch if user (GM or player) doesn't have any fudges yet
* Fix: Initial fudge definition not rendering in dialog #26
* Fix: DND5e skill roll mis-categorized
* Fix: Avg Karma History not showing
* Improve documentation
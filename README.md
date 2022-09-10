![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/UranusBytes/foundry-die-hard) ![GitHub Releases](https://img.shields.io/github/downloads/UranusBytes/foundry-die-hard/latest/total) ![GitHub Releases](https://img.shields.io/github/downloads/UranusBytes/foundry-die-hard/total)

![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffoundry-die-hard&colorB=4aa94a) ![Foundry Version](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https%3A%2F%2Fgithub.com%2FUranusBytes%2Ffoundry-die-hard%2Freleases%2Flatest%2Fdownload%2Fmodule.json) 

Die Hard
========
This Foundry VTT module is intended to provide functionality that modifies/adjusted die rolls in certain systems.

**NOTE:** This module is still BETA and under active development.  Functionality is still prone to change and/or bugs to be discovered.

**v10 Warning:** With v10 still in test releases, multiple 'hacks' have had to be implemented to make this module work until bugs are fixed upstream in v10. (Currently tested up to 10.277)  

# Current module Functionality
## Fudge
Allow the GM to influence raw die rolls (just the dice) or roll totals (dice + modifiers) for given players and/or GM.  The influence can ensure that the roll is above, below, or equal to a defined value.  The influence can be one time (next roll) or ongoing (until paused).
## Karma
Keep a history of die rolls per user, and if they are below a threshold over a defined history, either force the next roll to be above a minimum value (Simple), or increase the roll by a small amount until the average is above the threshold (Average).

# Global Config
The individual functionality can be enabled/disabled within settings (Game Settings -> Configure Settings -> Module Settings)
![die-hard-fudge](docs/die-hard-config.jpg)

Fudge
=====
![die-hard-fudge](docs/die-hard-fudge.jpg)

With the module enabled, a poop icon will be displayed above the message tray. 

![die-hard-fudge-1](docs/die-hard-fudge-1.jpg)

If there are active fudges, the poop icon will be colored orange

Clicking on this icon will open a configuration dialog.

![die-hard-fudge-1](docs/die-hard-fudge-1b.jpg)

Right clicking on the poop icon will pause the execution of all active fudges.  Right clicking again will resume the execution of all active fudges.

![die-hard-fudge-2](docs/die-hard-fudge-2.jpg)

Within the dialog, to create a new Fudge do the following:
* Select the GM/Online Player this fudge should affect
* Select the type of roll this should affect (system specific, roll total, or raw die roll)
* Enter a formula using the format of "OPERATOR VALUE"
  * Available operators are:
    * `<`
    * `<=`
    * `>`
    * `>=`
    * `=`
    * `!=`
  * Examples: `< 5` or `> 15`
* Click on `Create Fudge`

All active fudges are listed at the right.
Status details if a fudge is active or disabled.
Under normal circumstances, once a fudge has been applied (or evaluated as not being needed for a roll), the fudge will be disabled.  A green circular arrow means the fudge will NOT disable itself after being processed (persistent on)

![die-hard-fudge-3](docs/die-hard-fudge-3.jpg)

When a roll is evaluated for fudge, if the roll is adjusted by Fudge a whisper is sent to the GM defining what was changed.

![die-hard-fudge-4](docs/die-hard-fudge-4.jpg)

If the fudge is evaluated, but an adjustment is not needed, a whisper is sent stating as such.

![die-hard-fudge-5](docs/die-hard-fudge-5.jpg)

If the fudge is evaluated and an adjustment is attempted, but after 150 attempts the roll can still not be made to meet the criteria, further attempts are stopped and a whisper is sent.  Note that during each attempt, if the roll was "closer" to the desired criteria it is kept.

![die-hard-fudge-6](docs/die-hard-fudge-6.jpg)


## Mechanics
The way Fudge works is that the next die roll of that type (either system specific, total result w/ modifiers, or a raw die roll) for that Player will be evaluated against the formula defined.  If it doesn't meet the formula criteria, then the result is rerolled in the background (max of 150 times), with the final result presented to the PC.  As it is re-rolling, if the attempted re-roll is "closer" to the desired fudge value, it will be kept.  (For circumstances where the fudge can never be achieved, at least get as close as possible)  The GM will get a whisper that outlines if the fudge was used (with all failed results), or if it was removed without being used (if first roll met formula criteria).  When a fudge is used to influence a die (or would have, but original result was sufficient), then the fudge is disabled (unless persistence is enabled). 

Karma
=====
![die-hard-fudge](docs/die-hard-karma.jpg)

With the module enabled, a praying hands icon will be displayed above the message tray. 

![die-hard-fudge](docs/die-hard-karma-0.jpg)

Clicking on this icon will open a configuration dialog.
The available karma options can be enabled by clicking on the button

![die-hard-fudge](docs/die-hard-karma-1.jpg)

Within the dialog, the logic used to influence each Karma module is adjustable.  For Avg Karma, the adjustment can be consistent (+X, +X, +X, etc.) until the threshold is reached, or it can be cumulative (+X, +2X, +3X, etc...) until the threshold is reached.
The current history of player rolls is displayed.

![die-hard-fudge-2](docs/die-hard-karma-2.jpg)


# Mechanics
Karma only works on raw die rolls; it does not influence total rolls directly (only indirectly by influencing the raw rolls).

For Simple Karma, it looks at the previous N rolls, and if all are below the threshold it will ensure that the following roll is over the value of Y.

For Avg Karma, it averages the previous N rolls, and if the average is below the threshold it will adjust (nudge) the result by an increment of Y.  Y can be consistent (+X, +X, +X, etc.) or cumulative (+X, +2X, +3X, etc...).  Each successive roll will be adjusted until the avg threshold is reached.

# Future Planned Functionality
## RNG Alternatives
Alternative RNG 

# Thanks
None of this module would be possible without the inspiration, and continued guidance/support/feedback, from @apoapostolov.  Thank you!


Development
===========
## Reporting Issues and Suggestions
Open an issue: https://github.com/UranusBytes/foundry-die-hard/issues

## Future Planning
Currently being (quasi) managed here: https://github.com/users/UranusBytes/projects/1

## Currently Supported Systems
* DND5e
* PF2e

## Troubleshoot
Extensive logging is used within the module, with debug logging enabled with the package debugging enabled

## Known Issues
* Incompatible with [Better Rolls for 5e](https://github.com/RedReign/FoundryVTT-BetterRolls5e) #6
* Incompatible with [Monk's Token Bar](https://github.com/ironmonk88/monks-tokenbar) #24
* It's possible to define a fudge that is impossible to achieve (especially when considering modifiers.  Or to define a fudge of "> 20" for a d20).  The failsafe is attempting to fudge 150 times, at which point the closest possible is provided.
* When the fudge config dialog is open, fudge status/list is not updated if any are changed by other GMs and/or PC/Actor rolls
* If both Fudge and Karma are enabled, a single roll that's being fudged can be influenced by karma

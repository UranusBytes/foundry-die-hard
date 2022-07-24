Die Hard
========
This Foundry VTT module is intended to provide functionality that modifies/adjusted die rolls in certain systems.

**NOTE:** This module is still VERY alpha and under active development.  I would not recommend using in a real game yet...

Development
===========
## Reporting Issues and Suggestions
Open an issue: https://github.com/UranusBytes/foundry-die-hard/issues

## Future Planning
Currently being (quasi) managed here: https://github.com/users/UranusBytes/projects/1

## Currently Supported Systems
* DND5e (current)

## Future Supported Systems
* PF2e

## Troubleshoot
Extensive logging is used within the module, with debug logging enabled with the package debugging enabled

## Known Issues
* Raw die rolls for actors not working (even if fudge defined on GM/Player)
* Actors throwing raw It's possible to define a fudge that is impossible to achieve (especially when considering modifiers.  Or to define a fudge of "> 20" for a d20).  The failsafe is attempting to fudge 150 times, at which point the closest possible is provided.
* When the fudge config dialog is open, fudge status/list is not updated if any are changed by other GMs and/or PC/Actor rolls

# Current module Functionality
## Fudge
Allow the GM to influence die rolls

# Fudge
![die-hard-fudge](docs/die-hard-fudge.jpg)

With the module enabled, a poop icon will be displayed above the message tray. 

![die-hard-fudge-1](docs/die-hard-fudge-1.jpg)

If there are active fudges, the poop icon will pulse orange

Clicking on this icon will open a configuration dialog.

![die-hard-fudge-2](docs/die-hard-fudge-2.jpg)

Within the dialog, to create a new Fudge do the following:
* Select the GM/Online Player/actor (currently only online player PCs) this should affect
* Select the type of roll this should affect (system specific or raw die roll)
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
A pulsing green circular arrow means the fudge will re-enable itself after being used

![die-hard-fudge-3](docs/die-hard-fudge-3.jpg)

# Mechanics
The way Fudge works is that the next die roll of that type (either system specific or a raw die roll) for that Player or Actor will be evaluated against the formula defined.  If it doesn't meet the formula criteria, then the die is rerolled in the background (max of 150 times), with the final result presented to the PC.  As it is re-rolling, if the attempted re-roll is "closer" to the desired fudge value, it will be kept.  (For circumstances where the fudge can never be achieved, at least get as close as possible)  The GM will get a whisper that outlines if the fudge was used (with all failed results), or if it was removed without being used (if first roll met formula criteria).  When a fudge is used to influence a die (or would have, but original result was sufficient), then the fudge is disabled. 

![die-hard-fudge-4](docs/die-hard-fudge-4.jpg)



# Future Planned Functionality
## Karmic dice
All for gradual adjustment/influence of player dice over time...

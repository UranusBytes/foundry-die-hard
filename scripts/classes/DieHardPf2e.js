import { dieHardLog } from '../lib/helpers.js';
import DieHardSystem from './DieHardSystem.js';

export default class DieHardPf2e extends DieHardSystem {
	constructor() {
		dieHardLog(false, 'DieHardPf2e.constructor');
		super();

		this.totalRollClassName = [
            "Roll",
            "CheckRoll",
            "StrikeAttackRoll",
        ];
		this.fudgeWhatOptions = [];
	}

	hookReady() {
		dieHardLog(false, 'PF2e System Hook - Ready');
	}
}

import DieHardSystem from "./DieHardSystem.js";
import {dieHardLog} from "../lib/helpers.js";

export const registerDieHardTests = quench => {
    dieHardLog(true, 'Die Hard - registerDieHardTests')

    quench.registerBatch("diehard.system", DieHardSystem.registerTests);

};
export default class DieHardFudgeRoll extends Roll {
  // This is a simple extension
  constructor(formula, data, options) {
    super(formula, data, options);
  }
 static get defaultOptions() {
   return super.defaultOptions;
 }
}

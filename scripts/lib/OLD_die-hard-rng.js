export default class OLD_dieHardRng extends MersenneTwister {
  constructor(formula, data, options) {
    super(formula, data, options);
    console.log('OLD_dieHardRoll constructed')
  }

  static random() {
    console.log('DieHard | Adjusting random')
  }



}
const UTIL = require('../util/util');

module.exports = {

  exit: () => {
    let fname = '';
    var exit_arr = [
      `Thank you ${fname}. Good Bye!!!`
    ];
    return UTIL.getRandomMessage(exit_arr);
  }
}
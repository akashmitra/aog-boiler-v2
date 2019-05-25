const UTIL = require('../util/util');
const { Carousel, Image, Suggestions } = require('actions-on-google');

module.exports = {
  fallback: (agent, buildResponse, resolve) => {
    let richConvList = [], convList = [];
    var fallback_arr = [
      `I didn't understand`,
      `I'm sorry, can you try again?`
    ];
    let msg = UTIL.getRandomMessage(fallback_arr);

    richConvList.push(msg);
    richConvList.push(new Suggestions(['Search resorts in Florida', 'My max TP', 'Upcoming vacations']));
    convList.push(msg);
    buildResponse(agent, richConvList, convList);
    resolve();
  }
}
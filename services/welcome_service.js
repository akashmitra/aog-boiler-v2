const UTIL = require('../util/util');
const { Carousel, Image, Suggestions } = require('actions-on-google');

module.exports = {

  welcome: (agent, callback) => {
    let convList = [];
    let fname = 'User';
    var welcome_arr = [
      `Hello ${fname}. How can I assist you?`,
      `Good Day ${fname}. How can I help you?`,
      `Hi ${fname}. I am here to help you. What assistance do you require?`
    ];

    let convMessage = UTIL.getRandomMessage(welcome_arr);

    convList.push(convMessage);
    callback(agent, convList, convMessage);    //buildResponse:(agent,convList,convMessage)
  }
};
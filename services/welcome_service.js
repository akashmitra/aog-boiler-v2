const UTIL = require('../util/util');
const DATA = require('../data/data');
const { Carousel, Image, Suggestions } = require('actions-on-google');
const https = require('https');
const CONFIG = require('../config');
const REQUEST = require('request');

module.exports = {
  welcome: (agent, buildResponse, resolve) => {
    REQUEST.get(CONFIG.api_endpoint, function (error, response, body) {
      const data = JSON.parse(body);
      let richConvList = [], convList = [];
      let fname = data.user.name.split(' ')[0];
      var welcome_arr = [
        `Hello ${fname}, Welcome to RITZY Hotels & Resorts. How can I assist you?`,
        `Good Day ${fname}, Welcome to RITZY Hotels & Resorts. How can I help you?`,
        `Hi ${fname}, Greetings from RITZY hotels & Resorts. I am here to help you. What assistance do you require?`
      ];

      let msg = UTIL.getRandomMessage(welcome_arr);

      richConvList.push(msg);
      richConvList.push(new Suggestions(['Search resorts in Florida', 'My max TP', 'Upcoming vacations']));
      convList.push(msg);
      buildResponse(agent, richConvList, convList);
      resolve();
    })
      .on('error', function (err) {
        console.log(err);
      });
  }
}
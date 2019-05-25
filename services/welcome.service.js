const UTIL = require('../util/util');
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
        `Hello ${fname}, Welcome to Wyndham Hotels & Resorts. I am Stacy. I can help you plan your vacation by providing you with the best options of resorts, let you know about your deposit details and can update you with your upcoming vacation plans too. How would you like to proceed?`
      ];

      let msg = UTIL.getRandomMessage(welcome_arr);

      richConvList.push(msg);
      richConvList.push(new Suggestions(['Search resorts in Florida', 'Deposit Details', 'Upcoming vacations']));
      convList.push(msg);
      buildResponse(agent, richConvList, convList);
      resolve();
    })
      .on('error', function (err) {
        console.log(err);
      });
  }
}
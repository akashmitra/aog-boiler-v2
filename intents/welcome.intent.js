const UTIL = require('../util/util');
const ERROR_UTIL = require('../util/errorUtil');
const welcome_service = require('../services/welcome.service');

module.exports = {
  welcome: (agent) => {
    try {
      var buildResponse = UTIL.buildResponse;
      return new Promise((resolve, reject) => {
        welcome_service.welcome(agent, buildResponse, resolve);
      });
    }
    catch (exception) {
      ERROR_UTIL.serverError(exception, agent);
    }
  }
};
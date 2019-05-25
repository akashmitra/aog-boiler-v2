const UTIL = require('../util/util');
const ERROR_UTIL = require('../util/errorUtil');
const fallback_service = require('../services/fallback.service');

module.exports = {
  fallback: (agent) => {
    try {
      var buildResponse = UTIL.buildResponse;
      return new Promise((resolve, reject) => {
        fallback_service.fallback(agent, buildResponse, resolve);
      });
    }
    catch (exception) {
      ERROR_UTIL.serverError(exception, agent);
    }
  }
};
const UTIL = require('../util/util');
const ERROR_UTIL = require('../util/errorUtil');
const exit_service = require('../services/exit.service');

module.exports = {
  exit: (agent) => {
    try {
      var buildResponse = UTIL.buildResponse;
      return new Promise((resolve, reject) => {
        exit_service.exit(agent, buildResponse, resolve);
      });
    }
    catch (exception) {
      ERROR_UTIL.serverError(exception, agent);
    }
  }
};
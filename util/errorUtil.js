const LOGGER = require('../log');

module.exports = {
  serverError: (exception, agent) => {
    console.log(exception);
    LOGGER.trace(exception);
    agent.add('Oops! There is a glitch in server. Could you please try again later?');
  }
};
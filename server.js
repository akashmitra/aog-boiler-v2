(function () {
  'use strict';

  const express = require('express');
  const bodyParser = require('body-parser');
  const http = require('http');
  const logger = require('./log');
  const UTIL = require('./util/util');
  const ERROR_UTIL = require('./util/errorUtil');
  
  const welcome_service = require('./services/welcome_service');
  const goodbye_service = require('./services/goodbye_service');
  const fallback_service = require('./services/fallback_service');

  const { WebhookClient } = require('dialogflow-fulfillment');
  const { Card, Suggestion } = require('dialogflow-fulfillment');
  const { Carousel, Image } = require('actions-on-google');

  const port = process.env.PORT || 3000;
  process.env.DEBUG = 'dialogflow:debug';

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


  app.post('/', (request, response) => {
    logger.trace(`Post hit!`);
    const agent = new WebhookClient({ request: request, response: response });
    logger.trace('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    logger.trace('Dialogflow Request body: ' + JSON.stringify(request.body));
    console.log(request.body);
    let callback = UTIL.buildResponse;

    function welcome() {
      try {
        welcome_service.welcome(agent, callback);
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function fallback() {
      try {
        let conv = agent.conv();
        agent.add(fallback_service.fallback(conv));
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function exit(agent) {
      agent.add(goodbye_service.exit());
    }

    function testWebhook(agent) {
      agent.add(`This went right inside Webhook`);
    }

    // Dialogflow intent Function Mapping
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Exit', exit);
    intentMap.set('TestWebhook', testWebhook);

    // Intent Error Handling: If req from Google Assistant use fn(googleAssistantOther) else fn(other)
    // if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
    //     intentMap.set(null, googleAssistantOther);
    // } else {
    //     intentMap.set(null, other);
    // }
    agent.handleRequest(intentMap);
  });

  app.get('/', (request, response) => {
    response.send(`Server running on port: ${process.env.PORT}. Move on. There is nothing to see here! `);
  });

  // Creating a server at port 
  http.createServer(app).listen(port, () => {
    logger.trace(`Express server listening on port ${port}`);
  });
}());

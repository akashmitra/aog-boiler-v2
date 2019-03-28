(function () {
  'use strict';

  const express = require('express');
  const bodyParser = require('body-parser');
  const http = require('http');

  const { WebhookClient } = require('dialogflow-fulfillment');
  const { Carousel, Image } = require('actions-on-google');

  const logger = require('./log');
  const UTIL = require('./util/util');
  const ERROR_UTIL = require('./util/errorUtil');
  const SESSION_UTIL = require('./util/sessionUtil');
  const welcome_service = require('./services/welcome_service');
  const test_service = require('./services/ssml.service');
  const searchResort_service = require('./services/searchResort_service');
  const deposit_service = require('./services/deposit_service');
  const confirmedVacation_service = require('./services/confirmedVacation_service');
  const goodbye_service = require('./services/goodbye_service');
  const fallback_service = require('./services/fallback_service');

  const port = process.env.PORT || 3000;
  process.env.DEBUG = 'dialogflow:debug';

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


  app.post('/', (request, response) => {
    const agent = new WebhookClient({ request: request, response: response });
    logger.trace('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    logger.trace('Dialogflow Request body: ' + JSON.stringify(request.body));

    var sessionID = UTIL.fetchSessionID(request);
    var buildResponse = UTIL.buildResponse;

    console.log(request.body);
    console.log(sessionID);

    function welcome() {
      try {
        return new Promise((resolve, reject) => {
          welcome_service.welcome(agent, buildResponse, resolve);
        });
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

    function searchResort() {
      try {
        let location = request.body.queryResult.parameters.geostate;
        let checkin_date = request.body.queryResult.parameters.checkin;
        let checkout_date = request.body.queryResult.parameters.checkout;

        let conv = agent.conv();
        // conv.user.storage.startResortIndex=0;        //Reset to beginning
        // conv.user.storage.resortLocation=location;    //Store location in session
        // conv.user.storage.checkin_date=checkin_date;
        // conv.user.storage.checkout_date=checkout_date;

        SESSION_UTIL.setSession(sessionID, 'startResortIndex', 0);          //Reset to beginning
        SESSION_UTIL.setSession(sessionID, 'resortLocation', location);     //Store location in session
        SESSION_UTIL.setSession(sessionID, 'checkin_date', checkin_date);
        SESSION_UTIL.setSession(sessionID, 'checkout_date', checkout_date);

        return new Promise((resolve, reject) => {
          searchResort_service.searchResort({ checkin_date, checkout_date, location },
            sessionID, agent, buildResponse, resolve);
        });
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function searchResortNext() {
      try {
        let conv = agent.conv();
        searchResort_service.searchResort(conv.user.storage.checkin_date,
          conv.user.storage.checkout_date,
          conv.user.storage.resortLocation,
          conv);
        agent.add(conv);
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function depositTradingPower() {
      try {
        let conv = agent.conv();
        agent.add(deposit_service.depositTradingPower(conv));
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function depositDetails() {
      try {
        let conv = agent.conv();
        deposit_service.depositDetails(conv);
        agent.add(conv);
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function upcomingVacation() {
      try {
        let conv = agent.conv();
        conv.user.storage.startResortIndex = 0;
        confirmedVacation_service.showUpcomingVacation(conv);
        agent.add(conv);
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function upcomingVacationNext() {
      try {
        let conv = agent.conv();
        confirmedVacation_service.showUpcomingVacation(conv);
        agent.add(conv);
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }

    function exit(agent) {
      agent.add(goodbye_service.exit());
    }

    function testWebhook(agent) {
      try {
        return new Promise((resolve, reject) => {
          test_service.test(agent, buildResponse, resolve);
        });
      }
      catch (exception) {
        ERROR_UTIL.serverError(exception, agent);
      }
    }


    // Dialogflow intent Function Mapping
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Search Resort', searchResort);
    intentMap.set('Search Resort Next', searchResortNext);
    intentMap.set('Deposit Trading Power', depositTradingPower);
    intentMap.set('Deposit Details', depositDetails);
    intentMap.set('Vacation Details', upcomingVacation);
    intentMap.set('Vacation Details Next', upcomingVacationNext);
    intentMap.set('Exit', exit);
    intentMap.set('TestWebhook', testWebhook);

    agent.handleRequest(intentMap);
  });


  app.get('/', (request, response) => {
    response.send('Say hello to AOG Chatbot! Running on port: ' + process.env.PORT);
    logger.trace(`Get hit!`);
  });


  // Creating a server at port 
  http.createServer(app).listen(port, () => {
    logger.trace(`Express server listening on port ${port}`);
  });
}());

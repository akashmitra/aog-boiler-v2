'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

/*---------------------- Utils ----------------------*/
const logger = require('./log');
const UTIL = require('./util/util');
const ERROR_UTIL = require('./util/errorUtil');
/*---------------------- Utils ----------------------*/

/*---------------------- Intents ----------------------*/
const welcome_intent = require('./intents/welcome.intent');
const fallback_intent = require('./intents/fallback.intent');
const exit_intent = require('./intents/exit.intent');
/*---------------------- Intents ----------------------*/

/*---------------------- Services ----------------------*/
const exit_service = require('./services/exit.service');
const fallback_service = require('./services/fallback.service');
/*---------------------- Services ----------------------*/


const port = process.env.PORT || 3000;
process.env.DEBUG = 'dialogflow:debug';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.post('/', (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
        agent.add(`I didn't understand`);
        agent.add(`I'm sorry, can you try again?`);
    }

    function yourFunctionHandler(agent) {
        agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
        agent.add(new Card({
            title: `Title: this is a card title`,
            imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
            buttonText: 'This is a button',
            buttonUrl: 'https://assistant.google.com/'
        })
        );
        agent.add(new Suggestion(`Quick Reply`));
        agent.add(new Suggestion(`Suggestion`));
        agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' } });
    }

    function googleAssistantHandler(agent) {
        let conv = agent.conv(); // Get Actions on Google library conv instance
        conv.ask('Hello from the Actions on Google client library!'); // Use Actions on Google library
        agent.add(conv); // Add Actions on Google library responses to your agent's response
    }

    // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('your intent name here', yourFunctionHandler);
    intentMap.set('your intent name here', googleAssistantHandler);
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


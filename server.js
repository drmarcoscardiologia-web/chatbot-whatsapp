const express = require("express");
const bodyParser = require("body-parser");
const { SessionsClient } = require("@google-cloud/dialogflow");
const { MessagingResponse } = require("twilio").twiml;

require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const projectId = process.env.DF_PROJECT_ID;
const languageCode = "pt-BR";

const dfClient = new SessionsClient({
    keyFilename: "credentials.json"
});

async function detectIntent(sessionId, text) {
    const sessionPath = dfClient.projectAgentSessionPath(projectId, sessionId);

    const request = {
        session: sessionPath,
        queryInput: { text: { text, languageCode } }
    };

    const responses = await dfClient.detectIntent(request);
    return responses[0].queryResult.fulfillmentText;
}

app.post("/webhook", async (req, res) => {
    try {
        const msg = req.body.Body;
        const from = req.body.From;

        const reply = await detectIntent(from, msg);

        const twiml = new MessagingResponse();
        twiml.message(reply);

        res.type("text/xml");
        res.send(twiml.toString());
    } catch (error) {
        console.error(error);
        const twiml = new MessagingResponse();
        twiml.message("Desculpe, ocorreu um erro.");
        res.type("text/xml");
        res.send(twiml.toString());
    }
});

    console.log("Server online");
});

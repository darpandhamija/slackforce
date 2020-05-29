"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    API_VERSION = 'v49.0';

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        params = req.body.text.split(":"),
        targetId = params[0],
        cadenceId = params[1],
        userId = params[2];
    console.log("Body : "+req.body.text);
    console.log("TargetId : "+targetId);
    console.log("Cadence Id : "+cadenceId);
    console.log("User Id : "+userId);

    let fields = {};
    let inputs = [];
    let input = {};
    input["salesCadenceNameOrId"] = cadenceId;
    input["targetId"] = targetId;
    input["userId"] = userId;
    inputs.push(input);
    fields["inputs"] = inputs;

    console.log("Payload : "+JSON.stringify(fields));

    force.request(oauthObj, '/services/data/' + API_VERSION + '/actions/standard/assignTargetToSalesCadence', 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            qs: {'_HttpMethod': 'PATCH'},
            json: true,
            body: fields
        }
    ).catch(error => {
        if (error.code == 401) {
            res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId+'   '+JSON.stringify(error));
        } else {
            console.log(error);
            res.send("An error as occurred");
        }
    });
    res.send("Target added to Cadence.");
};
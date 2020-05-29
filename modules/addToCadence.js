"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force");

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        params = req.body.text.split(":"),
        targetId = params[0],
        cadenceId = params[1],
        userId = params[2];

    let fields = [];
    let inputs = [];
    let input = {};
    input["salesCadenceNameOrId"] = cadenceId;
    input["targetId"] = targetId;
    input["userId"] = userId;
    inputs.push(input);
    fields["inputs"] = inputs;

    force.sfrequest(oauth, '/services/data/' + API_VERSION + '/actions/standard/assignTargetToSalesCadence', 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            qs: {'_HttpMethod': 'PATCH'},
            json: true,
            body: fields
        }
    );
    res.send("Target added to Cadence.");
};
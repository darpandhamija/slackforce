"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    API_VERSION = 'v49.0';

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        params = req.body.text.split(":"),
        targetId = params[0];
    console.log("Body : "+req.body.text);
    console.log("TargetId : "+targetId);

    let fields = {};
    let inputs = [];
    let input = {};
    input["targetId"] = targetId;
    input["completionReasonCode"] = "ManuallyRemoved";
    inputs.push(input);
    fields["inputs"] = inputs;

    console.log("Payload : "+JSON.stringify(fields));

    force.executeRequest(oauthObj, '/services/data/' + API_VERSION + '/actions/standard/removeTargetFromSalesCadence', 
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            qs: {'_HttpMethod': 'POST'},
            json: true,
            body: fields
        }
    ).then(data => {
        let attachments = [];
        let fields = [];
            fields.push({title: "Action", value: "Remove Target from Sales Cadence", short:true});
            fields.push({title: "Result", value: "Success", short:true});
            attachments.push({color: "#800000", fields: fields});
            res.json({text: "Remove Target from Sales Cadence result : ", attachments: attachments});
    }).catch(error => {
        if (error.code == 401) {
            res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId+'   '+JSON.stringify(error));
        } else {
            console.log(error);
            res.send("An error as occurred");
        }
    });
    
};
"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force");

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        limit = "";
    let param = req.body.text;

    if (!limit || limit=="") limit = 5;
    let q = "SELECT Id, Name, Status from Lead LIMIT "+ limit;
    let headerText = "Top " + limit + " Targets."
    if(param || param!=""){
        q = "SELECT Id, Name, Status FROM Lead WHERE Name LIKE '%" + req.body.text + "%' LIMIT "+ limit;
        headerText = "Targets filtered by : "+req.body.text;
    }

    force.query(oauthObj, q)
        .then(data => {
            let opportunities = JSON.parse(data).records;
            if (opportunities && opportunities.length > 0) {
                let attachments = [];
                opportunities.forEach(function (opportunity) {
                    let fields = [];
                    fields.push({title: "Lead", value: opportunity.Name, short: true});
                    fields.push({title: "Status", value: opportunity.Status, short: true});
                    fields.push({title: "Id", value: opportunity.Id, short: true});
                    attachments.push({
                        color: "#FCB95B",
                        fields: fields
                    });
                });
                res.json({
                    text: headerText,
                    attachments: attachments
                });
            } else {
                res.send("No records");
            }
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId+'   '+JSON.stringify(error));
            } else {
                console.log(error);
                res.send("An error as occurred");
            }
        });
};
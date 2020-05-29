"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force");

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        limit = req.body.text;
    if (!limit || limit=="") limit = 5;
    let q = "SELECT Name, FolderName, State, Id FROM ActionCadence LIMIT "+ limit;

    force.query(oauthObj, q)
        .then(data => {
            let opportunities = JSON.parse(data).records;
            if (opportunities && opportunities.length > 0) {
                let attachments = [];
                opportunities.forEach(function (opportunity) {
                    let fields = [];
                    fields.push({title: "Cadence Name", value: opportunity.Name, short: true});
                    fields.push({title: "Folder Name ", value: opportunity.FolderName, short: true});
                    fields.push({title: "State", value: opportunity.State, short: true});
                    fields.push({title: "Id", value: opportunity.Id, short: true});
                    attachments.push({
                        color: "#F0B95B",
                        fields: fields
                    });
                });
                res.json({
                    text: "Top " + limit + " Sales Cadences.",
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
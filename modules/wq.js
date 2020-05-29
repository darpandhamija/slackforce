"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    whoami = require("./whoami");

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId),
        limit = "";
    let userId = req.body.text;
    console.log("userId : "+userId);
    if (!limit || limit=="") limit = 5;
    if (!userId || userId=="") userId = whoami.global_user_id;
    console.log("global userId : "+userId);
    let q = "SELECT  Id, ActionCadenceStepId,Target.Name, TargetId, State, StepType, ActionCadenceName, ActionCadenceStep.TemplateId, StepTitle, ActionCadenceId, DueDateTime FROM  ActionCadenceStepTracker WHERE   ActionCadenceTracker.OwnerId = '"+userId+"' AND ActionCadenceTracker.State = 'Running' AND (State = 'Active' or State = 'Error') AND StepType in ('MakeACall', 'CreateTask', 'SendAnEmail', 'AutoSendAnEmail')   AND TargetId != null ORDER BY  ActionCadenceName ASC, ActionCadenceStepId ASC LIMIT "+ limit;
    console.log(q);
    force.query(oauthObj, q)
        .then(data => {
            let opportunities = JSON.parse(data).records;
            if (opportunities && opportunities.length > 0) {
                let attachments = [];
                opportunities.forEach(function (opportunity) {
                    let fields = [];
                    fields.push({title: "Sales Cadence Name", value: opportunity.ActionCadenceName, short: true});
                    fields.push({title: "Step Name", value: opportunity.StepTitle, short: true});
                    fields.push({title: "Target Name", value: opportunity.Target.Name, short: true});
                    fields.push({title: "Step Type", value: opportunity.StepType, short: true});
                    fields.push({title: "Due Date", value: opportunity.DueDateTime, short: true});
                    attachments.push({
                        color: "#FCBD5B",
                        fields: fields
                    });
                });
                res.json({
                    text: "Top " + limit + " Work Queue Items.",
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
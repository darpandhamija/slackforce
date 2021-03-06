"use strict";

global.global_user_id = "";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    WHOAMI_TOKEN = process.env.SLACK_WHOAMI_TOKEN;

exports.execute = (req, res) => {

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId);

    force.whoami(oauthObj)
        .then(data => {
            let userInfo = JSON.parse(data);
            console.log("UserInfoData "+JSON.stringify(data));
            console.log("UserInfo "+JSON.stringify(userInfo));
            let attachments = [];
            let fields = [];
            fields.push({title: "Name", value: userInfo.name, short:true});
            fields.push({title: "Salesforce User Name", value: userInfo.preferred_username, short:true});
            
            global.global_user_id = userInfo.user_id;
            
            fields.push({title: "Salesforce User Id", value: userInfo.user_id, short:false});
            
            attachments.push({color: "#65CAE4", fields: fields});
            res.json({text: "Your User Information:", attachments: attachments});
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
            } else {
                res.send("An error as occurred");
            }
        });
};

exports.getGlobalUserId = global_user_id;
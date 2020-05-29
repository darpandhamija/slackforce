"use strict";

exports.handle = (req, res) => {
    console.log(req.body);
    let attachments = [];
    let fields = [];
   	fields.push({title: "/whoami", value: "User Info", short: false});
    fields.push({title: "/cadences", value: "List of Sales Cadences", short: false});
    fields.push({title: "/targets", value: "List of recent Targets (Lead, Contact, Person Account)", short: false});
    fields.push({title: "/wq", value: "Work Queue", short: false});
    fields.push({title: "/addToCadence", value: "Assign Target to Sales Cadence", short: false});
    fields.push({title: "/removeFromCadence", value: "Remove Target from Sales Cadence", short: true});
    fields.push({title: "/makeACall", value: "(Coming Soon) Make a Call and Advance Cadence", short: true});
    fields.push({title: "/sendAnEmail", value: "(Coming Soon) Send an Email and Advance Cadence", short: true});
    
	attachments.push({
	    color: "#2019FB",
	    fields: fields
    });
    res.json({
		text: "All HVS Slack Commands",
        attachments: attachments
    });
    
}

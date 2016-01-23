var express = require('express');
var async = require('async');
var bodyParser = require('body-parser');

var foursquareClientID = process.env["FOURSQUARE_CLIENT_ID"];
var foursquareClientSecret = process.env["FOURSQUARE_CLIENT_SECRET"];
var foursquareUserToken = process.env["FOURSQUARE_USER_TOKEN"];

var foursquare = require('foursquare')({ "client_id": foursquareClientID, "client_secret": foursquareClientSecret, "v": "20160123" });
var Venue = foursquare.Venue;
var port = process.env.PORT || 3000

var app = express();
app.use(bodyParser.json());

app.post('/hook', function (req, res) {
    var body = req.body;
    var type = body.type;
    var data = body.data;

    if (type != "transaction.created") { console.log("Unsupported event type:", type); res.send({}); return; };

    var merchant = body.data.merchant;
    var online = merchant.online || false;
    var address = merchant.address;
    var emoji = merchant.emoji;

    var foursquareShout = emoji;

    if (online != false) { console.log("Unsupported transaction: online."); res.send({}); return; };
    
    Venue.find({ radius: 100.0, ll: address.latitude + "," + address.longitude })
        .then(function(body) {
            var venues = body
                .response
                .venues
                .map(function(attrs) {
                    return new Venue( attrs );
                })
                .filter(function (venue) {
                    return venue.attributes.location.postalCode == address.postcode;
                });
            
            if (venues.length == 0) { console.log("Error: No matching venues.", res.send({}); return }
            
            var venue = venues[0];
            venue.accessToken(foursquareUserToken)
                .checkin({ shout: foursquareShout }, function (error, result) {
                if (error) {
                    console.log("Error posting to Swarm:", error);
                }
                else {
                    console.log("Posted to Swarm:", merchant.name);
                }
            });
        });

    res.send({});
});

app.listen(port, function () {
    console.log('app listening on port:', port);
});

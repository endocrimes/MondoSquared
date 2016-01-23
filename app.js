var express = require('express');
var async = require('async');
var bodyParser = require('body-parser');

var foursquareClientID = process.env["FOURSQUARE_CLIENT_ID"];
var foursquareClientSecret = process.env["FOURSQUARE_CLIENT_SECRET"];
var foursquareUserToken = process.env["FOURSQUARE_USER_TOKEN"];

var foursquare = require('foursquare')({ "client_id": foursquareClientID, "client_secret": foursquareClientSecret, "v": "20160123" }); var Venue = foursquare.Venue;
var port = process.env.PORT || 3000

var app = express();
app.use(bodyParser.json());

app.post('/hook', function (req, res) {
    var body = req.body;
    var type = body.type;
    if (type != "transaction.created") { console.log("Unsupported event type:", type); res.send({}); return; };
    var merchant = body.data.merchant;
    var online = merchant.online || false;
    if (online != false) { console.log("Unsupported transaction: online."); res.send({}); return; };
    var address = merchant.address;
    
    Venue.find({ radius: 100.0, ll: address.latitude + "," + address.longitude })
        .then(function(body) {
            var venues = body.response.venues.map(function( attrs ){ return new Venue( attrs ); });
            venues = venues.filter(function (venue) {
                return venue.attributes.location.postalCode == address.postcode;
            });

            var first = venues[0];
            if (first == null) { console.log("Venue not found"); res.send({}); return;}

            console.log("We have a venue.");

            first.accessToken(foursquareUserToken).checkin({ shout: merchant.emoji }, function (error, result) {
                console.log("Error:", error, "Checkin:", result.body);
            })
        });

    res.send({});
});

app.listen(port, function () {
    console.log('app listening on port:', port);
});

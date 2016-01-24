# MondoSquared

Automatically check in on Swarm when you spend money.

Usage:
```
$ npm install
$ env PORT=3000 FOURSQUARE_CLIENT_ID=$client_id FOURSQUARE_CLIENT_SECRET=$client_secret FOURSQUARE_USER_TOKEN=$user_token node app.js
$ http --form POST "https://api.getmondo.co.uk/webhooks" \
    "Authorization: Bearer yourMondoAuthToken" \
    "account_id=youraccid" \
    "url=https://urltoyourapp.com/hook"
```

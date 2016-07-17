var google = require('googleapis');
var ObjectUtils = require("../../../../bin/ObjectUtils");
var OAuth2Client = google.auth.OAuth2;

var CLIENT_ID = '';
var CLIENT_SECRET = '';
var REDIRECT_URL = 'http://localhost:8686/oauth2callback';

var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

function Auth(context) {
    this.re = context.renderEngine;
}

Auth.prototype.getResult = function () {
    console.log('Auth');
    return new Promise(function (resolve, reject) {
        try {
            var url = oauth2Client.generateAuthUrl({
                access_type: 'offline', // will return a refresh token
                scope: ['https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/userinfo.email'] // can be a space-delimited string or an array of scopes
            });

            console.log(url);
            console.log(JSON.stringify(this.re.request));

            ObjectUtils.setKey(this.re.session, ['headers', 'Location'], url);
            ObjectUtils.setKey(this.re.session, ['responseCode'], 301);

            // this.re.session.header.redirectUrl = url;
            console.log(this.re.session.query);

            resolve({'computed': url});
        } catch (err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Auth;
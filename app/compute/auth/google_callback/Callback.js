var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');

var ObjectUtils = require("../../../../bin/ObjectUtils");

function Callback(context) {
    this.re = context.renderEngine;
}

Callback.prototype.getResult = function () {

    return new Promise(function(resolve, reject) {
        try{
            var code = this.re.session.query.code;
            if (!code) {
                return reject(new Error('no code'));
            }

            var CLIENT_ID = '';
            var CLIENT_SECRET = '';
            var REDIRECT_URL = 'http://localhost:8686/oauth2callback';

            var oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
            oauth2Client.getToken(code, (err, tokens) => {
                if (err) {
                    return callback(err);
                }
                oauth2Client.setCredentials(tokens);

                //TODO save tokens to session

                plus.people.get({ userId: 'me', auth: oauth2Client }, (err, profile) => {
                    if (err) {
                        console.err(err);
                        reject(err);
                    }

                    console.log(JSON.stringify(profile));

                    var redirectToUrl = this.re.session.cookies.redirectToUrl;
                    if(redirectToUrl) {
                        ObjectUtils.setKey(this.re.session, ['headers', 'Location'], redirectToUrl);
                        ObjectUtils.setKey(this.re.session, ['headers', 'Set-Cookie'], 'redirectToUrl=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
                        ObjectUtils.setKey(this.re.session, ['responseCode'], 301);
                    }

                    resolve({'computed': profile});
                });
            });


        } catch(err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Callback;
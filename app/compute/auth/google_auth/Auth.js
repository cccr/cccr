var google = require('googleapis');
var ObjectUtils = require("../../../../bin/ObjectUtils");
var OAuth2Client = google.auth.OAuth2;

function Auth(context) {
    this.re = context.renderEngine;
    this.args = context.content.args;
    const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} = this.args[0];
    this.oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
}

Auth.prototype.getResult = function () {
    console.log('Auth');
    return new Promise(function (resolve, reject) {
        try {
            var url = this.oauth2Client.generateAuthUrl({
                access_type: 'offline', // will return a refresh token
                scope: ['https://www.googleapis.com/auth/plus.me', 'https://www.googleapis.com/auth/userinfo.email'] // can be a space-delimited string or an array of scopes
            });

            var referer = this.re.request.headers.referer;
            if (referer) {
                this.re.session.setCookie.push('redirectToUrl=' + referer);
            }

            ObjectUtils.setKey(this.re.session, ['headers', 'Location'], url);
            ObjectUtils.setKey(this.re.session, ['responseCode'], 301);

            resolve({'computed': url});
        } catch (err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = Auth;
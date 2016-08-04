function IsSignedIn(context) {
    this.args = context.content.args;
    this.re = context.renderEngine;

    this.logger = context.newLogger(module.id);
}

IsSignedIn.prototype.getResult = function () {
    return new Promise(function (resolve, reject) {
        try {
            var isSignedIn = false;
            try {
                this.re.session.storage.googleProfile.emails.filter((o) => o.type === 'account')[0].value && (isSignedIn = true);
            } catch (err) {
            }

            this.logger.debug('isSignedIn: ', isSignedIn);

            var result = this.args[0][isSignedIn];
            var fn = () => {
                resolve({'computed': result});
            };

            if (typeof result === 'object' && !Array.isArray(result)) {
                var re = this.re.clone();

                //TODO
                re.contentReference = 'computed';

                this.logger.debug('re.readWithContent() <= ', JSON.stringify(result));

                re.readWithContent(result)
                    .catch((err) => {
                        this.logger.error('re.readWithContent()', parsedContentData);
                        reject(err)
                    })
                    .then((parsedContentData) => {
                        this.logger.debug('parsedContentData', parsedContentData);
                        result = parsedContentData.renderedResult || parsedContentData.computed;
                        fn();
                    });
            } else {
                fn();
            }


        } catch (err) {
            reject(err);
        }
    }.bind(this));
};

module.exports = IsSignedIn;
function Sling() {}

Sling.HOST = process.env.ENGRUN_SLING_HOST;
Sling.PORT = process.env.ENGRUN_SLING_PORT;
Sling.USERNAME = process.env.ENGRUN_SLING_USERNAME;
Sling.PASSWORD = process.env.ENGRUN_SLING_PASSWORD;

Sling.CONTENT_URL = `http://${Sling.HOST}:${Sling.PORT}/content/`;
Sling.AUTH_CONTENT_URL = `http://${Sling.USERNAME}:${Sling.PASSWORD}@${Sling.HOST}:${Sling.PORT}/content/`;

module.exports = Sling;
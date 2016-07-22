var winston = require('winston');
winston.level = process.env.LOG_LEVEL || 'warn';

function Logger() {
}

winston.loggers.add('Content', {
    console: {
        level: 'silly',
        colorize: true,
        label: 'Content'
    }
});

winston.loggers.add('RenderEngine', {
    console: {
        level: 'silly',
        colorize: true,
        label: 'RenderEngine'
    }
});


Logger.Content = winston.loggers.get('Content');
Logger.RenderEngine = winston.loggers.get('RenderEngine');

module.exports = Logger;
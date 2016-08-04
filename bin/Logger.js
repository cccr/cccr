var winston = require('winston');
winston.level = process.env.LOG_LEVEL || 'warn';

function Logger() {
}

const appLoggerLevels = {
    'app/compute/auth/isSignedIn/IsSignedIn.js': 'warn',
    'app/block/list/List.js': 'warn',
    'app/block/add/Add.js': 'warn',
    'app/quote/batchAdd/BatchAdd.js': 'warn'
};

winston.loggers.add('www', {
    console: {
        level: 'silly',
        colorize: true,
        label: 'www'
    }
});

winston.loggers.add('Content', {
    console: {
        level: 'warn',
        colorize: true,
        label: 'Content'
    }
});

winston.loggers.add('Component', {
    console: {
        level: 'warn',
        colorize: true,
        label: 'Component'
    }
});

winston.loggers.add('RenderEngine', {
    console: {
        level: 'warn',
        colorize: true,
        label: 'RenderEngine'
    }
});

winston.loggers.add('Function', {
    console: {
        level: 'warn',
        colorize: true,
        label: 'Function'
    }
});

winston.loggers.add('Routing', {
    console: {
        level: 'silly',
        colorize: true,
        label: 'Routing'
    }
});

var pathModule = require('path');
var cwd = process.cwd();

Logger.newLogger = (moduleId) => {
    name = pathModule.relative(cwd, moduleId);
    winston.loggers.add(name, {
        console: {
            level: appLoggerLevels[name],
            colorize: true,
            label: name
        }
    });
    return winston.loggers.get(name);
};

Logger.www = winston.loggers.get('www');
Logger.Content = winston.loggers.get('Content');
Logger.Component = winston.loggers.get('Component');
Logger.RenderEngine = winston.loggers.get('RenderEngine');
Logger.Function = winston.loggers.get('Function');
Logger.Routing = winston.loggers.get('Routing');

module.exports = Logger;
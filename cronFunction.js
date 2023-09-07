const cron = require('node-cron');

// Import the functions you want to call
const report = require('./report'); // Replace with the actual module path


async function cronFunction(id, options, config) {

    // Schedule  to run every Monday at 8:00 AM
    cron.schedule('0 8 * * 1', function () {
        options.sendwarning = true;
        options.reportManager = false;
        report(id, options, config);
    });

    // Schedule  to run every Wednesday at 8:00 AM
    cron.schedule('* * * * *', function () {
        options.sendwarning = false;
        options.reportManager = true;
        report(id, options, config);

    });
    return null;

}



module.exports = cronFunction;

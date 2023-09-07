const cron = require('node-cron');

// Import the functions you want to call
const report = require('./report'); // Replace with the actual module path


async function cronFunction(id, options, config) {

    // Schedule function1 to run every Monday at 8:00 AM
    cron.schedule('0 8 * * 1', function () {
        options.sendwarning = true;
        options.reportManager = false;
        // console.log('Running function1...');
        // console.log("options :", options);
        report(id, options, config);
    });

    // Schedule function2 to run every Wednesday at 8:00 AM
    cron.schedule('* * * * *', function () {
        options.sendwarning = false;
        options.reportManager = true;
        console.log('Running function2...');
        // console.log("options :", options);
        report(id, options, config);

    });
    return null;

}



module.exports = cronFunction;

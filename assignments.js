/*
node index.js assignments --get
node index.js assignments --post
node index.js assignments --delete
node index.js assignments --post --project_id string --person_id string --role_id string --start_date string($date) --end_date string($date) --minutes_per_day integer($int32)
node index.js assignments --post --project_id string --person_id string --role_id string --start_date string($date) --end_date string($date) --totaldays integer($int32)

function assignments() {

let minutes_per_day = 0
if (option.minutes_per_day && options.totaldays) {
console.log("Warning: minutes_per_day and totaldays will be added")
}
if (opption.minutes_per_day) {
minutes_per_day = opption.minutes_per_day
}
if (options.totaldays) {
const durationInWorkingDays = numberOfWorkingDaysBetween(options.start_date, options.end_date)
const fractionPerWorkingDay = options.totaldays / durationInWorkingDays
minutes_per_day = minutes_per_day + fractionPerWorkingDay * 7.5 * 60
};

*/

async function assignments(id, options, config) {
    console.error('Not implemented yet');
}

module.exports = assignments;

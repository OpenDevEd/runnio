/*
program
   .command('report')
      option: --lastweek Provides total hours for each user in the last week.
      option: --project 
  crontab: every monday morning: Send email to uses who have not completed timesheet.
  crontab: every wednesday morning: Send email to Claire/Ruthie, with list of uses who have not completed timesheet.
*/
const axios = require('axios');

async function fetchpeopleById(apiKey, params, id) {
    const baseUrl = `https://app.runn.io/api/v0/`;
    try {
        const response = await axios.get(`${baseUrl}/people/${id}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            params: params,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDatefromFormat(stringg)
{
    const year = parseInt(stringg.substring(0, 4));
const month = parseInt(stringg.substring(4, 6)) - 1; // Months are 0-indexed
const day = parseInt(stringg.substring(6, 8));
return new Date(year, month, day);
}

async function report(id, options, config) {
    const _id ="nr9hz84l8"; // you need give your own id , i am still working on it.
    const today = new Date();
    let todayDay = today.getDay();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDay + 1 - 7);
    let end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDay + 5 - 7);
    const params = {
        start: formatDate(start),
        end: formatDate(end),
        include_assignments: true,
    };
    const assignments = await fetchpeopleById(config.apikey, params, _id);
    // console.log(assignments.assignments);
    let totalHours = 0;
    for (let i = 0; i < assignments.assignments.length; i++) {
        let startAssignment = getDatefromFormat(assignments.assignments[i].start_date);
        let endAssignment = getDatefromFormat(assignments.assignments[i].end_date);
        if (startAssignment < start) {
            startAssignment = start;
        }
        if (endAssignment > end) {
            endAssignment = end;
        }
        let daysInAssignment = (endAssignment - startAssignment) / 1000 / 60 / 60 / 24 + 1;
        totalHours += assignments.assignments[i].minutes_per_day*daysInAssignment;

    }
    console.log("Total hours:", totalHours / 60);
    console.log("Last Monday:", formatDate(start));
    console.log("Last Friday:", formatDate(end));

}


module.exports = report;

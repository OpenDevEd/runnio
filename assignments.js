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


const axios = require('axios');
const fs = require('fs');


async function fetchAssignmentsPage(params, apiKey) {
    const baseUrl = `https://app.runn.io/api/v0/`;
    try {
        const response = await axios.get(`${baseUrl}/assignments`, {
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

async function fetchAssignments(apiKey, options) {
    let currentPage = 1;
    const params = {};
    if (options.per_page)
        params.per_page = options.per_page;
    if (options.page)
        params.page = options.page;
    if (options.start_date)
        params.start = options.start_date;
    if (options.end_date)
        params.end = options.end_date;

    if (options.page) {
        params.page = options.page;
        const response = await fetchAssignmentsPage(params, apiKey);
        return response;
    }
    let dateOfRun = new Date();
    const fetchedAssignments = [];
    const fetchNextPage = async () => {
        params.page = currentPage;
        try {
            // console.log("fetching page", currentPage);
            // console.log("seconds since epoch", new Date().getTime() / 1000 - dateOfRun.getTime() / 1000);
            const response = await fetchAssignmentsPage(params, apiKey);
            fetchedAssignments.push(...response);
            if (response.length > 0) {
                currentPage++;
                if (currentPage % 120 == 0) {
                    const SecondToComplteMinute = 60000 - (new Date().getTime() / 1000 - dateOfRun.getTime() / 1000);
                    if (SecondToComplteMinute > 0) {
                        // console.log(`waiting for ${SecondToComplteMinute} seconds`);
                        await new Promise(resolve => setTimeout(resolve, SecondToComplteMinute));
                    }
                    dateOfRun = new Date();
                }
                await fetchNextPage();
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    await fetchNextPage();
    return fetchedAssignments;
}

function numberOfWorkingDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const realStart = new Date(startDate);
    const end = new Date(endDate);
    let dayMilliseconds = 1000 * 60 * 60 * 24;
    let weekendDays = 0;
    while (start <= end) {
        let day = start.getDay();
        if (day == 0 || day == 6) {
            weekendDays++;
        }
        start.setTime(start.getTime() + dayMilliseconds);
    }
    return (end - realStart) / dayMilliseconds - weekendDays;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function shiftToNextMonday(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) { // Sunday
        date.setDate(date.getDate() + 1); // Shift to Monday
    } else if (dayOfWeek === 6) { // Saturday
        date.setDate(date.getDate() + 2); // Shift to Monday
    }
    return formatDate(date);

}
// Function to shift a date to the previous Friday if it's a weekend
function shiftToPreviousFriday(dateString) {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0) { // Sunday
    date.setDate(date.getDate() - 2); // Shift to Friday
  } else if (dayOfWeek === 6) { // Saturday
    date.setDate(date.getDate() - 1); // Shift to Friday
  }
  
  return formatDate(date);
}

async function PostAssignments(config, options) {

    let minutes_per_day = parseInt(options.minutes_per_day, 10)
    if (options.minutes_per_day && options.totaldays) {
        console.log("Warning: minutes_per_day and totaldays will be added")
    }
    options.start_date = shiftToNextMonday(options.start_date);
    options.end_date = shiftToPreviousFriday(options.end_date);
    if (options.totaldays) {
        const durationInWorkingDays = numberOfWorkingDaysBetween(options.start_date, options.end_date)
        const fractionPerWorkingDay = options.totaldays / durationInWorkingDays
        const fractionPerWorkingDayMinutes = fractionPerWorkingDay * 7.5 * 60

        minutes_per_day = minutes_per_day + fractionPerWorkingDayMinutes
    };
    const baseUrl = `https://app.runn.io/api/v0/`;
    const params = {};
    if (options.project_id)
        params.project_id = options.project_id;
    if (options.person_id)
        params.person_id = options.person_id;
    if (options.role_id)
        params.role_id = options.role_id;
    if (options.start_date)
        params.start_date = options.start_date;
    if (options.end_date)
        params.end_date = options.end_date;
    if (options.is_billable)
        params.is_billable = options.is_billable;
    if (options.note)
        params.note = options.note;
    if (options.phase_id)
        params.phase_id = options.phase_id;
    if (options.non_working_day)
        params.non_working_day = options.non_working_day;

    params.minutes_per_day = minutes_per_day;

    try {
        const response = await axios.post(`${baseUrl}/assignments`, params, {
            headers: {
                Authorization: `Bearer ${config.apikey}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}

async function deleteAssignments(config, id) {
    const baseUrl = `https://app.runn.io/api/v0/`;
    try {
        const response = await axios.delete(`${baseUrl}/assignments/${id}`, {
            headers: {
                Authorization: `Bearer ${config.apikey}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


async function assignments(id, options, config) {
    if ((options.get && options.post) || (options.get && options.delete) || (options.post && options.delete)) {
        console.log('Please select only one option from get, post, delete');
        return {};
    }
    if (options.post) {
        if (!options.project_id || !options.person_id || !options.role_id || !options.start_date || !options.end_date || !(options.minutes_per_day || options.totaldays)) {
            console.log('--project_id --person_id --role_id --start_date --end_date --minutes_per_day are required parameters');
            console.log('Please provide all the required parameters');
            return {};
        }
        else {
            const assignments = await PostAssignments(config, options);
            return assignments;
        }
    }
    else if (options.delete) {
        if (id.length < 0) {
            console.log("Please provide id to delete");
            return {};
        }
        for (let i = 0; i < id.length; i++) {
            await deleteAssignments(config, id[i]);
        }
        return {};
    }
    else {
        const assignments = await fetchAssignments(config.apikey, options);
        return assignments;
    }
}
module.exports = assignments;

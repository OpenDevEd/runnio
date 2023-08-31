/*
program
   .command('report')
      option: --lastweek Provides total hours for each user in the last week.
      option: --project 
  crontab: every monday morning: Send email to uses who have not completed timesheet.
  crontab: every wednesday morning: Send email to Claire/Ruthie, with list of uses who have not completed timesheet.
*/
const axios = require('axios');




async function fetchPeoplePage(params, apiKey) {
    const baseUrl = 'https://app.runn.io/api/v0';

    try {
        const response = await axios.get(`${baseUrl}/people`, {
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
async function fetchPeople(apiKey, options) {
    let currentPage = 1;
    const params = {};
    const fetchedPeople = [];
    let dateOfRun = new Date();
    const fetchNextPage = async () => {
        params.page = currentPage;
        try {
            // console.log("currentPage",currentPage);
            const response = await fetchPeoplePage(params, apiKey);
            fetchedPeople.push(...response);
            if (response.length > 0) {
                currentPage++;
                if (currentPage % 120 == 0) {
                    const SecondToComplteMinute = 60000 - (new Date().getTime() / 1000 - dateOfRun.getTime() / 1000);
                    if (SecondToComplteMinute > 0) {
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
    return fetchedPeople;
}



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

async function reportOneByOne(options, config,userId,userName) {
    const today = new Date();
    let todayDay = today.getDay();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDay + 1 - 7);
    let end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDay + 5 - 7);
    const params = {
        start: formatDate(start),
        end: formatDate(end),
        include_assignments: true,
    };
    const assignments = await fetchpeopleById(config.apikey, params, userId);
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
    return  totalHours / 60 ;
}








async function report(id, options, config) {
    const people = await fetchPeople(config.apikey, options);
    const report = {};
    for (let i=0;i<people.length;i++)
    {
        const hours=await reportOneByOne(options, config,people[i].id,people[i].name)
        report[people[i].name] = hours;

    }
    console.log(report)
    return report
}

module.exports = report;

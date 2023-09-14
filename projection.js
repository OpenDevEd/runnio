

const axios = require('axios');
// const { assign } = require('lodash');

async function fetchteamsPage(params, apiKey) {
    const baseUrl = 'https://app.runn.io/api/v0';

    try {
        const response = await axios.get(`${baseUrl}/teams`, {
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


async function fetchpeopleById(apiKey, options, id) {
    const params = {};

    if (options.include_actuals) {
        params.include_actuals = options.include_actuals;
    }

    if (options.include_assignments) {
        params.include_assignments = options.include_assignments;
    }

    if (options.start) {
        params.start = options.start;
    }

    if (options.end) {
        params.end = options.end;
    }

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
        return undefined;
    }
}



async function fetchteams(apiKey, params) {
    let currentPage = 1;
    const fetchedPeople = [];
    let dateOfRun = new Date();
    const fetchNextPage = async () => {
        params.page = currentPage;
        try {
            // console.log("currentPage",currentPage);
            const response = await fetchteamsPage(params, apiKey);
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


function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getMonthRange(year, monthOffset) {
    const firstDayOfMonth = new Date(year, monthOffset, 1);
    const lastDayOfMonth = new Date(year, monthOffset + 1, 0);
    return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
}


function getNextMonths(manymonths) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const nextMonths = [];

    for (let i = 0; i < manymonths; i++) {
        const monthOffset = currentMonth + i;
        const yearOffset = Math.floor(monthOffset / 12);
        const monthIndex = monthOffset % 12;
        const year = currentYear + yearOffset;
        const [startDate, endDate] = getMonthRange(year, monthIndex);
        const monthName = monthNames[monthIndex];
        const workingDaysCount = getWorkingDaysCount(new Date(startDate), new Date(endDate));
        nextMonths.push({ month: monthName, start: startDate, end: endDate, workingDaysCount: workingDaysCount });
    }

    return nextMonths;
}


function parseDateString(dateString) {
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1;
    const day = parseInt(dateString.substring(6, 8));

    return new Date(year, month, day);
}

function getWorkingDaysCount(startDate, endDate) {
    let workingDaysCount = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();

        // Check if the day is a working day (Monday to Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            workingDaysCount++;
        }

        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    return workingDaysCount;
}


// async function decimalToHHMM(decimal) {
//     // Separate integer and decimal parts
//     const integerPart = Math.floor(decimal);
//     const decimalPart = decimal - integerPart;

//     // Calculate hours and minutes
//     const hours = integerPart;
//     const minutes = Math.round(decimalPart * 60);

//     // Format as HH:MM
//     const HH = String(hours).padStart(2, '0');
//     const MM = String(minutes).padStart(2, '0');

//     return `${HH}:${MM}`;
// }

async function projection(id, options, config) {
    const nextMonths = getNextMonths(options.months);
    const params = {};
    let startday = "";
    let endday = "";
    params.include_assignments = true;
    const allprojection = [];


    const teams = await fetchteams(config.apikey, {});
    let peoplelist = {};
    for (const team of teams) {
        if (["wposey4w", "9w4s8om9"].includes(team.id)) {
            continue;
        }
        peoplelist[team.name] = [];
        const people = team.people;
        for (const person of people) {
            if (peoplelist[team.name].includes(person)) {
                continue;
            }
            else {
                peoplelist[team.name].push(person);
            }
        }
    }
    // console.log(peoplelist);
    for (const team of Object.keys(peoplelist)) {
        if (options.byteam)
            console.log("Team :", team);
        //     for (const person of peoplelist[team]) {
        // }

        const teamprojection = [];
        for (const person of peoplelist[team]) {
            let persondata = {};
            for (const month of nextMonths) {

                persondata.name = person.name;
                let totalHours = 0;
                params.start = month.start;
                params.end = month.end;

                const fetchePeople = await fetchpeopleById(config.apikey, params, person.id);
                for (const assignment of fetchePeople.assignments) {
                    if (new Date(parseDateString(assignment.start_date)) < new Date(month.start))
                        startday = new Date(month.start);
                    else
                        startday = new Date(parseDateString(assignment.start_date));
                    if (new Date(parseDateString(assignment.end_date)) > new Date(month.end))
                        endday = new Date(month.end);
                    else
                        endday = new Date(parseDateString(assignment.end_date));

                    const workingDaysCount = getWorkingDaysCount(startday, endday);
                    totalHours += workingDaysCount * assignment.minutes_per_day / 60;
                }
                const procentage = totalHours / (month.workingDaysCount * 7.5) * 100;
                persondata[month.month] = procentage.toFixed(0) + "%";
            }
            allprojection.push(persondata);
        if (options.byteam)
            teamprojection.push(persondata);

        }
        if (options.byteam)
        console.table(teamprojection);
    }
    return allprojection;
}

module.exports = projection;
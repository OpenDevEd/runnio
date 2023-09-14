
const axios = require('axios');
const fs = require('fs');

async function fetchProjectsPage(params, apiKey) {
    const baseUrl = 'https://app.runn.io/api/v0';

    try {
        const response = await axios.get(`${baseUrl}/projects`, {
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


async function fetchProjects(apiKey, options) {
    let currentPage = 1;
    const params = {};
    if (options.per_page) {
        // console.log("per_page");
        params.per_page = options.per_page;
    }
    options.no_include_archived ? (params.include_archived = false) : (params.include_archived = true);

    const fetchedProjects = [];


    let dateOfRun = new Date();
    const fetchNextPage = async () => {
        params.page = currentPage;
        try {
            const response = await fetchProjectsPage(params, apiKey);
            fetchedProjects.push(...response);
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
    return fetchedProjects;
}



async function fetchprojectById(apiKey, options, id) {
    const params = {};
    options.no_include_archived ? (params.include_archived = false) : (params.include_archived = true);

    if (options.include_assignments) {
        params.include_assignments = options.include_assignments;
    }

    if (options.include_actuals) {
        params.include_actuals = options.include_actuals;
    }

    if (options.start) {
        params.start = options.start;
    }

    if (options.end) {
        params.end = options.end;
    }

    const baseUrl = `https://app.runn.io/api/v0/`;
    try {
        const response = await axios.get(`${baseUrl}/projects/${id}`, {
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

function getDatefromFormat(stringg) {
    const year = parseInt(stringg.substring(0, 4));
    const month = parseInt(stringg.substring(4, 6)) - 1; // Months are 0-indexed
    const day = parseInt(stringg.substring(6, 8));
    return new Date(year, month, day);
}

function numberOfWorkingDaysBetween(startDate, endDate, checkactuals) {
    const start = new Date(startDate);
    const realStart = new Date(startDate);
    let end = new Date(endDate);
    if (checkactuals) {

        if (start > new Date()) {
            return 0;
        }
        if (end > new Date()) {
            end = new Date();
        }
    }
    let dayMilliseconds = 1000 * 60 * 60 * 24;
    let weekendDays = 0;
    while (start <= end) {
        let day = start.getDay();
        if (day == 0 || day == 6) {
            weekendDays++;
        }
        start.setTime(start.getTime() + dayMilliseconds);
    }
    return (end - realStart) / dayMilliseconds - weekendDays + 1;
}

async function fetchprojectValueById(apiKey, options, id) {
    options.include_assignments = true;
    const listdata = [];
    for (let i = 0; i < id.length; i++) {
        const fetchedProject = await fetchprojectById(apiKey, options, id[i]);
        listdata.push({ "id": id[i] })
        listdata[i].name = fetchedProject.name;
        // console.log("fetchedProject: ", fetchedProject);
        let assigmentsDays = 0;
        let actualDays = 0;
        let scheduledDays = 0;
        for (let j = 0; j < fetchedProject.assignments.length; j++) {
            let numberOfWorkingDays = numberOfWorkingDaysBetween(getDatefromFormat(fetchedProject.assignments[j].start_date), getDatefromFormat(fetchedProject.assignments[j].end_date), false)
            let numberOfWorkingDaysactuals = numberOfWorkingDaysBetween(getDatefromFormat(fetchedProject.assignments[j].start_date), getDatefromFormat(fetchedProject.assignments[j].end_date), true)

            // console.log("start_date: ", fetchedProject.assignments[j].start_date);
            // console.log("end_date: ", fetchedProject.assignments[j].end_date);
            // console.log("numberOfWorkingDays: ", numberOfWorkingDays, "numberOfWorkingDaysactuals: ", numberOfWorkingDaysactuals);
            assigmentsDays += numberOfWorkingDays;
            scheduledDays += numberOfWorkingDays - numberOfWorkingDaysactuals;
            // assigmentshours += fetchedProject.assignments[j].total_minutes;
            actualDays += numberOfWorkingDaysactuals;
        }
        let estimated_minutes = 0;
        for (let j = 0; j < fetchedProject.budget_roles.length; j++) {
            estimated_minutes += fetchedProject.budget_roles[j].estimated_minutes;
        }
        // listdata[i].assigmentshours = parseInt(assigmentshours / 60);
        listdata[i].assigmentsDays = parseInt(assigmentsDays);
        listdata[i].actualDays = parseInt(actualDays);
        listdata[i].scheduledDays = parseInt(scheduledDays);
        // listdata[i].estimated_minutes = parseInt(estimated_minutes / 60);
        // if (estimated_minutes / 60 !== 0) {
        //     listdata[i].percentage = parseInt((assigmentshours / 60) / (estimated_minutes / 60) * 100);
        // } else {
        //     listdata[i].percentage = 0;
        // }
    }
    // console.log("data: ", listdata);
    return listdata;
}



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
        throw error;
    }
}



async function projects(id, options, config) {
    if (options.value) {
        if (options.byteam) {
            const fetchedTeams = await fetchteams(config.apikey, options);
            // console.log("Team :", fetchedTeams);
            const filteredObject = fetchedTeams.find(item => item.id === options.byteam);
            // console.log("Team :", filteredObject);
            const peopleIds = filteredObject.people.map(person => person.id);
            // console.log("peopleIds :", peopleIds);
            const listIdProjects = [];
            for (let i = 0; i < peopleIds.length; i++) {
                const people = await fetchpeopleById(config.apikey, options, peopleIds[i]);
                // console.log("people :", people.projects);
                for (let j = 0; j < people.projects.length; j++) {
                    if(!listIdProjects.includes(people.projects[j].id))
                        listIdProjects.push(people.projects[j].id);
                }
            }
            // console.log("listIdProjects :", listIdProjects);
            id = listIdProjects;
            // const people = await fetchpeopleById(config.apikey, options, peopleIds[0]);
            // console.log("people :", people.projects);

            // return {};
        }
        const fetchedProjectValue = await fetchprojectValueById(config.apikey, options, id);
        return fetchedProjectValue;
    }
    try {
        const fetchedProjects = [];
        if (id.length > 0) {
            for (let i = 0; i < id.length; i++) {
                const fetchedProject = await fetchprojectById(config.apikey, options, id[i]);
                fetchedProjects.push(fetchedProject);
            }
        } else {
            const projects = await fetchProjects(config.apikey, options);
            fetchedProjects.push(...projects);
        }
        return fetchedProjects;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}



module.exports = projects;

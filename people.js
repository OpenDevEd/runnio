
const axios = require('axios');
const fs = require('fs');



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
    if (options.per_page) {
        params.per_page = options.per_page;
    }
    if (options.include_placeholders) {
        params.include_placeholders = options.include_placeholders;
    }
    if (options.include_projects) {
        params.include_projects = options.include_projects;
    }

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

async function people(id, options, config) {
    try {        
        const fetchedPeople = [];

        if (id.length > 0) {
            for (let i = 0; i < id.length; i++) {

                const fetchedProject = await fetchpeopleById(config.apikey, options, id[i]);
                fetchedPeople.push(fetchedProject);
            }
        } else {
            const people = await fetchPeople(config.apikey, options);
            fetchedPeople.push(...people);
        }
        return fetchedPeople;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error; 
    }
}



module.exports = people;

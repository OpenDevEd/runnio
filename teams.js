

const axios = require('axios');




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



async function fetchteamById(apiKey, options, id) {
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
        const response = await axios.get(`${baseUrl}/teams/${id}`, {
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


async function teams(id, options, config) {
    try {
        const fetchedTeams = [];
        if (id.length > 0) {
            for (let i = 0; i < id.length; i++) {
                const fetchedTeam = await fetchteamById(config.apikey, options, id[i]);
                fetchedTeams.push(fetchedTeam);
            }
        } else {
            const teams = await fetchteams(config.apikey, options);
            fetchedTeams.push(...teams);
        }
        return fetchedTeams;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}

module.exports = teams;
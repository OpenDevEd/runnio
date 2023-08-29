
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
        console.log("per_page");
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

async function projects(id, options, config) {
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

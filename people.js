
const axios = require('axios');
const fs = require('fs');
const confdir = require('os').homedir() + "/.config/runnio-cli/"
const CONFIG_FILE = confdir + 'config.json';


function fetchPeoplePage(params, apiKey) {
    const baseUrl = 'https://app.runn.io/api/v0';

    return axios.get(`${baseUrl}/people`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        params: params,
    })
        .then(response => response.data)
        .catch(error => {
            throw error;
        });
}

function fetchPeople(apiKey, options) {
    let currentPage = 1;
    params = {}
    if (options.perpage) {
        params.perpage = options.perpage
    }
    if (options.include_placeholders) {
        params.include_placeholders = options.include_placeholders
    }
    if (options.include_projects) {
        params.include_projects = options.include_projects
    }
    if (options.include_archived) {
        params.include_archived = options.include_archived
    }


    const fetchNextPage = () => {
        params.page = currentPage
        fetchPeoplePage(params, apiKey)
            .then(response => {
                console.log(response); // Handle the data as needed

                if (response.next) {
                    currentPage++; // Move to the next page
                    fetchNextPage(); // Fetch the next page
                }
            })
            .catch(error => {
                console.error('An error occurred:', error);
            });
    };

    fetchNextPage(); // Start fetching pages
}


function fetchPeopleById(apiKey, options, id) {
    let params = {}
    if (options.start) {
        params.start = options.start
    }
    if (options.end) {
        params.end = options.end
    }
    if (options.include_assignments) {
        params.include_assignments = options.include_assignments
    }
    if (options.include_actuals) {
        params.include_actuals = options.include_actuals
    }
    const baseUrl = `https://app.runn.io/api/v0/`;

    return axios.get(`${baseUrl}/people/${id}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        params: params,
    })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            throw error;
        });
}




function people(id, options) {
    try {
        fs.readFile(CONFIG_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            const config = JSON.parse(data);
            if (id.length > 0) {
                for (let i = 0; i < id.length; i++)
                    fetchPeopleById(config.apikey, options, id[i]);
            }
            else
                fetchPeople(config.apikey, options);

        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

module.exports = people;

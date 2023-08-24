
const axios = require('axios');
const fs = require('fs');
const confdir = require('os').homedir() + "/.config/runnio-cli/"
const CONFIG_FILE = confdir + 'config.json';


function fetchProjectsPage(params, apiKey) {
    const baseUrl = 'https://app.runn.io/api/v0';

    return axios.get(`${baseUrl}/projects`, {
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

function fetchProjects(apiKey, options) {
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

    options.no_include_archived? params.include_archived = false : params.include_archived = true


    const fetchNextPage = () => {
        params.page = currentPage
        fetchProjectsPage(params, apiKey)
            .then(response => {
                console.log(response); // Handle the data as needed

                if (response.next) {
                    currentPage++; // Move to the next page
                    // if (options.page)
                    //     return
                    fetchNextPage(); // Fetch the next page
                }
            })
            .catch(error => {
                console.error('An error occurred:', error);
            });
    };

    fetchNextPage(); // Start fetching pages
}


function fetchprojectById(apiKey, options, id) {
    let params = {}
    options.no_include_archived? params.include_archived = false : params.include_archived = true
    
    if (options.perpage) {
        params.perpage = options.perpage
    }
    
    if (options.page) {
        params.page = options.page
    }
    const baseUrl = `https://app.runn.io/api/v0/`;

    return axios.get(`${baseUrl}/projects/${id}`, {
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




function projects(id, options) {
    try {
        fs.readFile(CONFIG_FILE, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }
            const config = JSON.parse(data);
            if (id.length > 0) {
                for (let i = 0; i < id.length; i++)
                    fetchprojectById(config.apikey, options, id[i]);
            }
            else
                fetchProjects(config.apikey, options);

        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

module.exports = projects;

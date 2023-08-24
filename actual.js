




const axios = require('axios');
const fs = require('fs');
const confdir = require('os').homedir() + "/.config/runnio-cli/"
const CONFIG_FILE = confdir + 'config.json';




async function fetchActualPage(params, apiKey) {
    const baseUrl = 'https://app.runn.io/api/v0';

    try {
        const response = await axios.get(`${baseUrl}/actuals`, {
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


async function fetchActual(apiKey, options) {
    let currentPage = 1;
    const params = {};
    if (options.per_page) {
        params.per_page = options.per_page;
    }
    if (options.start ) {
        params.start  = options.start ;
    }
    if (options.end) {
        params.end = options.end;
    }
    if(options.page)
    {
        params.page = options.page;
        const response = await fetchActualPage(params, apiKey);
        return response;
    }

    const fetchedActual = [];

    const fetchNextPage = async () => {
        params.page = currentPage;
        try {
            const response = await fetchActualPage(params, apiKey);
            fetchedActual.push(...response); // Accumulate fetched actual
            if (response.next) {
                currentPage++;
                await fetchNextPage();
            }
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    await fetchNextPage();
    return fetchedActual;
}




async function actual(id, options) {
    try {
        const configData = await fs.promises.readFile(CONFIG_FILE, 'utf8');
        const config = JSON.parse(configData);    
        const fetchedactual = await fetchActual(config.apikey, options);
        
        return fetchedactual;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error; 
    }
}


module.exports = actual;
// actuals
// time_entry

const axios = require('axios');
const fs = require('fs');

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
    if (options.per_page)
        params.per_page = options.per_page;
    if (options.start)
        params.start = options.start;
    if (options.end)
        params.end = options.end;

    if (options.page) {
        params.page = options.page;
        const response = await fetchActualPage(params, apiKey);
        return response;
    }
    const fetchedActual = [];
    let dateOfRun = new Date();
    const fetchNextPage = async () => {
        params.page = currentPage;
        try {
            const response = await fetchActualPage(params, apiKey);
            fetchedActual.push(...response);
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
    return fetchedActual;
}




async function actuals(id, options, config) {
    try {
        const fetchedactual = await fetchActual(config.apikey, options);

        return fetchedactual;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}


module.exports = actuals;
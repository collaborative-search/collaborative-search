'use strict';

const bing = require('./providers/bing');
const providers = {
    'bing': bing
};

exports.fetch = function (providerName, query, vertical, pageNumber, resultsPerPage,sessionId) {
    if (invalidProvider(providerName)) return invalidProvider(providerName);
    return providers[providerName].fetch(query, vertical, pageNumber, resultsPerPage,sessionId);
};

exports.getById = function (id, providerName) {
    if (invalidProvider(providerName)) return invalidProvider(providerName);
    return providers[providerName].getById(id);
};

function invalidProvider(providerName) {
    if (providerName in providers) {
        return false;
    } else {
        return Promise.reject({
            name: 'Bad Request',
            message: 'Provider does not exist'
        });
    }
}

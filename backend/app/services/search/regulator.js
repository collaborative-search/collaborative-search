'use strict';

const provider = require('./provider');
const bookmark = require('../../services/features/bookmark');
const viewedResults = require('./viewedResults');

exports.fetch = async function (query, vertical, pageNumber, sessionId, userId, providerName) {
    // Convert falsy string to false boolean for cleaner if statements below.
    // relevanceFeedback = false;
    //let distributionOfLabour = false;



    const resultPerPageCount = 10;
    const bookmarks = await bookmark.getBookmarks(sessionId);
    const excludes = await bookmark.getBookmarks(sessionId, true);
    const userBookmarks = await bookmark.getUserBookmarks(sessionId, userId);
    const bookmarkIds = bookmarks.map(bookmark => bookmark.url);
    const excludeIds = excludes.map(exclude => exclude.url);
    const collapsibleIds = bookmarkIds.concat(excludeIds);
    const userBookmarkIds = userBookmarks.map(bookmark => bookmark.url);
    const bookmarkIdMap = {};
    bookmarkIds.forEach(id => {
        bookmarkIdMap[id] = true;
    });
    const collapsibleIdMap = {};
    collapsibleIds.forEach(id => {
        collapsibleIdMap[id] = true;
    });

    console.log("here")
    const response = await provider.fetch(providerName, query, vertical, pageNumber, resultPerPageCount, sessionId);
    response.results = addMissingFields(response.results);
    return response;
};


function addMissingFields(results) {
    return results.map(result => {
        if (!result.name.replace(/\s/g, '') && result.text) {
            result.name = result.text.slice(0, 80) + "...";
        }
        if (!result.name.replace(/\s/g, '')) {
            result.name = "No name available"
        }
        if (result.id && result.text && !result.text.replace(/\s/g, '')) {
            result.text = "No text available"
        }
        if (result.snippet && !result.snippet.replace(/\s/g, '')) {
            result.snippet = "No text available"
        }
        return result;
    });
}

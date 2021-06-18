
'use strict';

const mongoose = require('mongoose');
const ClickThrough = mongoose.model('ClickThrough');
const sw = require('stopword')
const natural = require('natural');
const dataSet = require('./words')
//const SentencePreprocessor = require('./SentencePreprocessor')
var spellcheck = new natural.Spellcheck(dataSet.words);

const BingApi = require('node-bing-api')({
    accKey: '############################' || process.env.BING_ACCESS_KEY,
    rootUri: "https://api.bing.microsoft.com/v7.0/" || "https://api.datamarket.azure.com/Bing/SearchWeb/v1/"
});

/**
 * Fetch data from bing and return formatted results.
*/

const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017';
const DB = 'searchDB'

function isNumeric(str) {
    if (typeof str != "string") return false  
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

function preprocess(sentence) {
    sentence = sentence.toLowerCase()
    var words = new natural.WordTokenizer().tokenize(sentence)
    words = sw.removeStopwords(words)

    //console.log(words)

    var newWords = []
    for (var i = 0; i < words.length; i++) {
        //var word = words[i]
        var word = ''
        var tmpWord = words[i].toString()
        if (!isNumeric(tmpWord)) {
            if (!spellcheck.isCorrect(tmpWord)) {
                tmpWord = spellcheck.getCorrections(words[i])[0]
            }

            word = natural.PorterStemmer.stem(tmpWord)
        }
        else {
            word = tmpWord
        }
        //console.log(word)
        newWords.push(word)
    }
    newWords.sort()
    return newWords.join('')
}

async function addEntryToClickThrough(respValues) {

    for (var i = 0; i < respValues.length; i++) {

        let doc = await ClickThrough.findOne({ url: respValues[i].url })
        //console.log(doc)
        if (!doc) {
            let clickThrough = new ClickThrough({ url: respValues[i].url, total: 1, clicks: 0 })
            clickThrough.save()
        }
        else {
            let totalCnt = doc.total + 1
            doc.total = totalCnt
            doc.save()
        }

    }
}

function left(i) { return Math.floor((2 * i + 1)) }
function right(i) { return Math.floor((2 * i + 2)) }

function MaxHeapify(pq) {
    var max = 0;
    var l = left(max);
    var r = right(max);

    //console.log(l, r, pq.length)
    while (l < pq.length & r < pq.length) {
        //console.log(l, r, pq.length)

        if (pq[max].priority > pq[l].priority && pq[max].priority > pq[r].priority) {
            return pq
        }
        else {
            if (pq[l].priority <= pq[r].priority) {
                var tmp = pq[r]
                pq[r] = pq[max]
                pq[max] = tmp
                max = r
                l = left(max);
                r = right(max);
            }
            else {
                var tmp = pq[l]
                pq[l] = pq[max]
                pq[max] = tmp
                max = l
                l = left(max);
                r = right(max);
            }
        }
    }

    if (r >= pq.length && l < pq.length && pq[l].priority > pq[max].priority) {
        var tmp = pq[l]
        pq[l] = pq[max]
        pq[max] = tmp
        max = l
    }
    return pq
}

function extractMax(pq) {

    // Store the minimum value, and remove it from heap
    if (pq.length == 1) {
        return [pq[0], []];
    }
    var maxRes = pq[0];
    pq[0] = pq[pq.length - 1];
    pq.splice(-1, 1)

    pq = MaxHeapify(pq);
    //console.log(l, r, pq.length)

    // console.log("PRINTING")
    // for (var i = 0; i < pq.length; i++) {
    //     console.log(pq[i].priority)
    // }

    return [maxRes, pq];
}

function isFound(elem, hashTable) {
    //for
    //console.log(elem)
    return hashTable[elem.url] == true
}

//var queue = [];
exports.fetch = async function (query, vertical, pageNumber, resultsPerPage, sessionId) {
    // let querydup = query
    // let query = preprocess(query)
    return new Promise(async function (resolve, reject) {
        console.log(sessionId)

        let querydup = query
        query = preprocess(query)
        let id = sessionId + '_' + query
        let pages = []
        let finalRes = []
        let hashTable = {}

        let destCnt = pageNumber * 10
        let startCnt = destCnt - 9



        MongoClient.connect(dbUrl, async function (err, client) {
            console.log("Connected successfully to server");
            const db = client.db(DB);
            db.collection('PriorityQueue').findOne({ _id: id }, async function (err, results) {
                if (err) throw err;
                if (results) {
                    console.log('found')
                    //console.log(results)
                    let pq = results.priorityqueue

                    while (pq.length >= 1) {
                        var maxNode = extractMax(pq)
                        pq = maxNode[1]

                        var maxVal = maxNode[0]
                        //console.log(maxVal)
                        //console.log("PRINTING")
                        //for (var i = 0; i < pq.length; i++) {
                        //console.log(maxVal.priority)
                        //}
                        if (maxVal.priority > 1) {
                            pages.push(maxVal.result)
                        }
                        else {
                            break
                        }

                    }
                    //console.log(pages)
                    //return pages
                    if (pages.length >= destCnt) {
                        while (startCnt <= destCnt) {
                            finalRes.push(pages[startCnt])
                            hashTable[pages[startCnt].url] = true
                            startCnt++
                        }
                    }
                    else if (pages.length > startCnt - 1) {
                        pageNumber = 1
                        while (startCnt - 1 < pages.length) {
                            finalRes.push(pages[startCnt - 1])
                            hashTable[pages[startCnt - 1].url] = true
                            startCnt++
                        }
                    }
                    else {
                        pageNumber = pageNumber - Math.ceil(pages.length / 10)
                    }

                }
                else {
                    //return null
                    pages = []
                    pageNumber = pageNumber
                }
            })
        });



        // if (pages != null) {
        //     console.log(pages)
        // }
        const callback = function (err, res, body) {
            if (err) return reject(err);

            // console.log('in callback')

            //console.log(body.webPages.value)

            let respValues = body.webPages.value

            //addEntryToClickThrough(respValues)

            //const data = formatResults(vertical, body);
            //console.log(body.webPages.value = pages)

            //pages = pages.concat(body.webPages.value)
            // console.log(queue.length)
            // console.log(queue)
            // while(finalRes.length < 10 && queue.length>0){
            //     finalRes.push(queue.shift())
            // }
            //console.log("length : ", respValues.length)

            var i = 0
            while (i < respValues.length && finalRes.length < 10) {
                //console.log(respValues[i],i)
                if (!isFound(respValues[i], hashTable)) {
                    //console.log(i)
                    finalRes.push(respValues[i])
                }
                i++
            }
            // while(i<10){
            //     queue.push(respValues[i])
            //     i++
            // }
            addEntryToClickThrough(finalRes)

            //console.log(finalRes)

            body.webPages.value = finalRes
            const data = formatResults(body);
            //console.log(data)

            resolve(data);
        };


        const options = constructOptions(pageNumber);


        if (vertical === 'web') BingApi.web(querydup, options, callback);
        else throw { name: 'Bad Request', message: 'Invalid vertical' }
    });
};

/**
 * Format result body received from search api call.
 */
function formatResults(body) {
    if (!body) {
        throw new Error('No response from bing api.');
    }

    if (!("value" in body || "webPages" in body)) {
        return {
            results: [],
            matches: 0
        };
    }


    body = body.webPages
    

    return {
        results: body.value,
        matches: body.totalEstimatedMatches
    };
}

function constructOptions(pageNumber) {
    const count = 10;
    const mkt = 'en-US';
    const offset = (pageNumber - 1) * count;

    return {
        offset: offset,
        count: count,
        mkt: mkt
    };
}

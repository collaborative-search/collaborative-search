const SearchCtrl = require('../../controllers/rest/search');
const FeatureCtrl = require('../../controllers/rest/feature');
const mongoose = require('mongoose');
const ClickThrough = mongoose.model('ClickThrough');
const sw = require('stopword')
const natural = require('natural');
const dataSet = require('./words')
var spellcheck = new natural.Spellcheck(dataSet.words);
const MongoClient = require('mongodb').MongoClient;
const e = require('express');
const dbUrl = 'mongodb://localhost:27017';
const DB = 'searchDB'

module.exports = function (router) {
    router.use(function (req, res, next) {
        res.header('Content-Type', 'application/json');
        next();
    });


    router.get('/search/:vertical', SearchCtrl.search);

    router.get('/session/:sessionId/query', FeatureCtrl.getQueryHistory);
    router.get('/session/:sessionId/bookmark', FeatureCtrl.getBookmarks);
    router.get('/session/:sessionId/exclude', FeatureCtrl.getExcludes);
    router.post('/session/:sessionId/bookmark', FeatureCtrl.addBookmark);
    router.post('/session/:sessionId/exclude', FeatureCtrl.addExclude);
    router.delete('/session/:sessionId/bookmark', FeatureCtrl.removeBookmark);
    router.post('/session/:sessionId/bookmark/star', FeatureCtrl.starBookmark);
    router.delete('/session/:sessionId/exclude', FeatureCtrl.removeExclude);
    router.get('/session/:sessionId/chat', FeatureCtrl.getChatMessageList);
    router.post('/session/:sessionId/chat', FeatureCtrl.addChatMessage);

    router.post('/clickthrough/update', async function (req, res) {
        let doc = await ClickThrough.findOne({ url: req.body.url })
        //console.log(doc)
        let clicksCnt = doc.clicks + 1
        doc.clicks = clicksCnt
        doc.save()
        return res.send({ status: 200, message: 'updated' });
    })
    router.post('/clickthrough/getdata', async function (req, res) {
        let doc = await ClickThrough.findOne({ url: req.body.url })
        //console.log(doc)
        let clicksCnt = doc.clicks
        let totalCnt = doc.total
        return res.send({ status: 200, clicks: clicksCnt, total: totalCnt });
    })

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
            console.log(word)
            newWords.push(word)
        }
        newWords.sort()
        return newWords.join('')
    }

    function left(i) { return Math.floor((2 * i + 1)) }
    function right(i) { return Math.floor((2 * i + 2)) }

    function parent(i) {
        return Math.floor((i - 1) / 2);
    }
    function MaxHeapify(pq) {
        var max = 0;
        var l = left(max);
        var r = right(max);

        //console.log(l, r, pq.length)
        while (l < pq.length & r < pq.length) {
            console.log(l, r, pq.length)

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


    function heapify(pq) {
        console.log("IN HEAPIFY", pq.length)
        heap_size = pq.length
        var i = heap_size - 1;

        while (i > 0 && pq[parent(i)].priority < pq[i].priority) {
            var tmp = pq[i]
            pq[i] = pq[parent(i)]
            pq[parent(i)] = tmp

            i = parent(i);
        }
        return pq
    }
    router.post('/priorityqueue', async function (req, res) {

        let query = preprocess(req.body.query)
        let sessionId = req.body.sessionId
        let result = req.body.result
        let interest = req.body.interest
        let id = sessionId + '_' + query

        let obj = {
            url: result.url,
            result: result,
            priority: interest
        }

        MongoClient.connect(dbUrl, async function (err, client) {
            console.log("Connected successfully to server");
            const db = client.db(DB);
            await db.collection('PriorityQueue').findOne({ _id: id }, async function (err, result) {
                if (err) throw err;
                if (result) {
                    console.log('found')
                    //console.log(result)
                    var pq = result.priorityqueue
                    var index = -1
                    for (var i = 0; i < pq.length; i++) {
                        if (pq[i].url === obj.url) {
                            index = i
                        }
                    }
                    if (index > -1) {
                        let oldInterest = pq[index].priority
                        let newInterest = obj.priority

                        newInterest = (oldInterest + newInterest) / 2
                        obj.priority = newInterest

                        while (index > 0) {
                            var par = parent(index)
                            var tp = pq[par]
                            pq[par] = pq[index]
                            pq[index] = tp
                            index = par
                        }


                        //pq.splice(index, 1);
                        //pq.push(obj)
                        //pq = heapify(pq)
                        pq[0] = obj
                        pq = MaxHeapify(pq)
                        db.collection('PriorityQueue').update(
                            { "_id": id },
                            {
                                "priorityqueue": pq
                            }

                        )
                    }
                    else {
                        pq.push(obj)
                        pq = heapify(pq)
                        db.collection('PriorityQueue').update(
                            { "_id": id },
                            {
                                "priorityqueue": pq
                            }

                        )

                    }

                    // await db.collection('PriorityQueue').findOne({ _id: sessionId, [`${query}`]: { $elemMatch: { "query": query } } }, async function (err, docs) {
                    //     if (err) throw err;
                    //     if (docs) {
                    //         //var pq = docs.queries.query[]
                    //         console.log(docs)
                    //         console.log(docs[query][0].priorityqueue)
                    //         var pq = docs[query][0].priorityqueue
                    //         var index = -1
                    //         for (var i = 0; i < pq.length; i++) {
                    //             if (pq[i].url === obj.url) {
                    //                 index = i
                    //             }
                    //         }
                    //         if (index > -1) {
                    //             console.log("in found")
                    //             pq.splice(index, 1);
                    //             pq.push(obj)
                    //             db.collection('PriorityQueue').updateOne(
                    //                 { "_id": sessionId },
                    //                 {

                    //                     [`${query}`]: [{
                    //                         "query": query,
                    //                         "priorityqueue": pq
                    //                     }]
                    //                 }

                    //             )
                    //         }
                    //         else {
                    //             console.log("in not found")
                    //             pq.push(obj)
                    //             console.log(pq)
                    //             db.collection('PriorityQueue').updateOne(
                    //                 { "_id": sessionId },
                    //                 {

                    //                     [`${query}`]: [{
                    //                         "query": query,
                    //                         "priorityqueue": pq
                    //                     }]

                    //                 }
                    //             )
                    //         }


                    //     }
                    //     else {
                    //         // var PQ = new PriorityQueue({ comparator: function(a, b) { return b - a; }})

                    //         // PQ.queue(5)
                    //         // PQ.queue(2)
                    //         // PQ.queue(3)
                    //         // console.log(PQ)

                    //         db.collection('PriorityQueue').update(
                    //             { "_id": sessionId },
                    //             {
                    //                 "$push":
                    //                 {
                    //                     [`${query}`]: {
                    //                         "query": query,
                    //                         "priorityqueue": Array(obj)
                    //                     }
                    //                     // "queries":
                    //                     // {
                    //                     //     "query": query,
                    //                     //     "priorityQueue": query
                    //                     // }
                    //                 }
                    //             }
                    //         )
                    //     }
                    //     //db.close();
                    // });

                }
                else {
                    await db.collection('PriorityQueue').insertOne({ _id: id, priorityqueue: Array(obj) }, async function (err, res) {
                        if (err) throw err;
                        console.log("Collection created!");
                        //db.close();
                    });
                }
            })
            res.status(200).send({ status: 'OK' });

            //client.close();
        });

    })
};

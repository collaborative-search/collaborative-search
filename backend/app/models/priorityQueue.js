'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PriorityQueueSchema = new Schema({
    _id: {
        type: String,
        required: true,
        queries: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Query',
            required: true
        }
    },

});


const QuerySChema = new Schema({
    query: {
        type: String,
        required: true,
        priorityqueue: {
            type: Object,
            required: true
        }
    },

});


module.exports = {
    Query: mongoose.model('Query', QuerySChema),
    PriorityQueue: mongoose.model('PriorityQueue', PriorityQueueSchema)
};
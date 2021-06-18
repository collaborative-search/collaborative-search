'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const ClickThroughSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    clicks: {
        type: Number,
        required: true
    }
});

module.exports = {
    ClickThrough: mongoose.model('ClickThrough', ClickThroughSchema)
};
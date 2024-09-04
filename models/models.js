const mongoose = require('mongoose');

const datesheetSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    }
});
module.exports = mongoose.model('Datesheet', datesheetSchema);
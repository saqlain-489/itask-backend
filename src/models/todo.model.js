const mongoose = require('mongoose')

const todoschema = new mongoose.Schema({
    Title: { type: String, required: true },
    Description: String,
    Location: String,
    Address:String,
    DateTime:Date,
    Level:String,
    Picture:String,
    checked:Boolean,
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: Date
})

module.exports = mongoose.model('Todos', todoschema)
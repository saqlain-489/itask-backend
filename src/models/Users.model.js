// src/models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,  
    resetPasswordExpires: Date,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    light: { type: Boolean },
    view: { type: Boolean },
    isAdmin: { type: Boolean },
    profilePic: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);

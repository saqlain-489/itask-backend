
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require('../models/Users.model')
const secretKey = 'sklajdlaks'


async function registerUser(data) {
    const { name, email, password } = data;
    const existingUser = await Users.findOne({ email });

    if (existingUser) {
        throw new Error("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new Users({
        name:name,
        email:email,
        password: hashedPassword,
        light: true,
        view: true,
        isAdmin: false,
     
    });

    await user.save();
       const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        secretKey,
        { expiresIn: "7d" }
    );

    return {user,token};
}

async function loginUser(data) {
    const { email, password } = data;

    const user = await Users.findOne({ email });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        secretKey,
        { expiresIn: "7d" }
    );

    return { user, token };
}

module.exports = {
    registerUser,
    loginUser,
};



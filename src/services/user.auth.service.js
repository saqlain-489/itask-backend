
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require('../models/Users.model')
const secretKey = 'sklajdlaks'
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');
const { error } = require("console");

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
const FORGOT_TOKEN_EXPIRY_MS = 1000 * 60 * 60;

async function forgotPassword(email) {
    try {
    if (!email) throw new Error('Email is required');

    const user = await Users.findOne({ email });

    if (user) {
 
      const rawToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + FORGOT_TOKEN_EXPIRY_MS;
      await user.save();

  
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

      const html = `
        <p>You (or someone else) requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here to reset your password</a>.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `;

     
      console.log("Password reset link:", resetUrl);

      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html
      });
    }

    
    // res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error('forgotPassword error', err);
    // res.status(500).json({ message: 'Server error' });
  }
}
module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
};



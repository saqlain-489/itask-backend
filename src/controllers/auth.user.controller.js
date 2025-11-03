const authUserServices = require("../services/user.auth.service");

const registerUser = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { name, email, password } = req.body;

    const { newUser, token } = await authUserServices.registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      data: { name, email }
      , token
    });
  } catch (err) {
    console.error('Error in registerUser:', err);
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authUserServices.loginUser(req.body);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        light: user.light,
        view: user.view,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
// const User = require('../models/User');
const User = require('../models/Users.model')
const { sendEmail } = require('../utils/email');

const FORGOT_TOKEN_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });

    if (user) {
      // create raw token
      const rawToken = crypto.randomBytes(32).toString('hex');

      // hash token before saving
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + FORGOT_TOKEN_EXPIRY_MS;
      await user.save();

      // send email with link
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

      const html = `
        <p>You (or someone else) requested a password reset.</p>
        <p>Click <a href="${resetUrl}">here to reset your password</a>.</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `;

      // 🟢 Log the link for testing (in case email doesn’t arrive)
      console.log("Password reset link:", resetUrl);

      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        html
      });
    }

    // Generic response
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error('forgotPassword error', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/auth/reset-password/:token
async function resetPassword(req, res) {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) return res.status(400).json({ message: 'Token missing' });
  if (!password) return res.status(400).json({ message: 'Password required' });

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    // set new password
    user.password = await bcrypt.hash(password, 10);

    // clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    // Optionally: log out existing sessions, or issue new JWT here
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('resetPassword error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};



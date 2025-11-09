// const authUserServices = require("../services/user.auth.service");
const authUserServices = require('../services/user.auth.service')
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const secretKey = 'sklajdlaks'
const jwt = require("jsonwebtoken");
const User = require('../models/Users.model')
const { sendEmail } = require('../utils/email');

const registerUser = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { name, email, password } = req.body;

    const { newUser, accesstoken, refreshToken } = await authUserServices.registerUser(req.body);
    res.status(201).json({
      message: "User registered successfully",
      newUser,
      accesstoken,
      refreshToken
    });
  } catch (err) {
    console.error('Error in registerUser:', err);
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, accesstoken, refreshToken } = await authUserServices.loginUser(req.body);

    if (user && refreshToken) {
      await User.findByIdAndUpdate(user._id, { refreshToken: refreshToken }, { new: true, useFindAndModify: false });
    }
    console.log(user.refreshToken)

    res.status(200).json({
      message: "Login successful",
      user: {
        role: user.role,
        id: user._id,
        name: user.name,
        email: user.email,
        light: user.light,
        view: user.view,
        isAdmin: user.isAdmin,
        refreshToken: user.refreshToken,
        // accesstoken:user.accesstoken
      },
      accesstoken,
      refreshToken,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }


    const decoded = jwt.verify(refreshToken, secretKey);
    console.log(decoded)

    const user = await User.findById(decoded.id);
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }


    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid brefresh token" });
    }


    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(401).json({ message: "Invalid or expidfred refresh token" });
  }
}


async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    await authUserServices.forgotPassword(email); // Call the service instead of recursive call
    res.json({ message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    console.error('forgotPassword error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


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

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

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
  resetPassword,
  refreshAccessToken
};



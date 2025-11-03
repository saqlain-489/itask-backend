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

module.exports = { registerUser, loginUser };


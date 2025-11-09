const userServices = require('../services/user.service')


const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 4;

  const results = await userServices.getUsers(page, pageSize)
  res.json(results)
};


const createUser = async (req, res) => {
  try {
    const newUser = await userServices.createUser(req.body)
    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id
    const deleted = await userServices.deleteUser(id)
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const patchUser = async (req, res) => {
  try {
    const id = req.params.id
    const edited = await userServices.patchUser(id, req.body);
    if (!edited) return res.status(404).json({ message: 'User not found' })
    res.json(edited)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userServices.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id; 
    const edited = await userServices.patchUser(userId, req.body);
    if (!edited) return res.status(404).json({ message: 'User not found' });
    res.json(edited);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  createUser,
  getUsers,
  deleteUser,
  patchUser,
  updateCurrentUser,
  getCurrentUser
};

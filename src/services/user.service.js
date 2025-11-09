// const User = require('../models/user.model')

const User = require('../models/Users.model')


async function getUsers(page = 1, pageSize = 4) {
  // const skip = (page - 1) * pageSize;
  // ().skip(skip).limit(pageSize)
  const users = await User.find();
  const total = await User.countDocuments();
  // const totalPages = Math.ceil(total / pageSize);

  return {
    // page,
    // per_page: pageSize,
    total,
    // total_pages: totalPages,
    data: users,
  };
}

async function createUser(data) {
  const newUser = await User.create({
    f_name: data.f_name,
    l_name: data.l_name,
  });
  
  return newUser;
}

async function deleteUser(id) {
  const deleted = await User.findByIdAndDelete(id);
  return !!deleted;
}

async function patchUser(id, updates) {
  updates.updatedAt = new Date();
  const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
  console.log(updatedUser);
  return updatedUser;
}
async function getUserById(id) {
  const user = await User.findById(id);
  return user;
}

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  patchUser,
  getUserById
};

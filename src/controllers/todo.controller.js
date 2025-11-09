const { json } = require('express')
const todoServices = require('../services/todo.service')

const getAlltodos = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const pageSize = parseInt(req.query.pageSize) || 9
  const results = await todoServices.getAlltodos(page, pageSize)
  res.json(results)
}

const gettodos = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 6

    const results = await todoServices.gettodos(page, pageSize, req.user.id)
    res.json(results)
    // res.status()
  } catch (error) {
    res.status(500).json({ error: err.message })

  }
}

const createTodo = async (req, res) => {

  try {
    const newTodo = await todoServices.createtodo(req.body, req.user.id)
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }

};

const deletetodo = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    const deleted = await todoServices.deletetodo(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: "User deleted Successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}

const patchTodo = async (req, res) => {
  try {
    const id = req.params.id
    const edited = await todoServices.patchtodo(id, req.body);
    if (!edited) return res.status(404).json({ message: 'User not found' })
    res.json(edited)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const searchtodo = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    const todos = await todoServices.searchtodos(query, userId)

    res.json({ data: todos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
}
module.exports = {
  createTodo,
  gettodos,
  deletetodo,
  patchTodo,
  getAlltodos,
  searchtodo,

}
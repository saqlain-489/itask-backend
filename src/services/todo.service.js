const Todos = require('../models/todo.model')

async function getAlltodos(  page = 1, pageSize = 6,) {
  
    const skip = (page - 1) * pageSize;   
    const todos = await Todos.find().skip(skip).limit(pageSize);
    const total = await Todos.countDocuments();
    const totalPages = Math.ceil(total / pageSize)

    return {
        page_no: page,
        per_page: pageSize,
        total_todos: total,
        total_pages: totalPages,
        data: todos,
    };
}

async function gettodos(page = 1, pageSize = 6, userId) {
    const skip = (page - 1) * pageSize;   
    const todos = await Todos.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(pageSize);
    const total = await Todos.countDocuments({ userId });
    const totalPages = Math.ceil(total / pageSize)

    return {
        page_no: page,
        per_page: pageSize,
        total_todos: total,
        total_pages: totalPages,
        data: todos,
    };
}

async function createtodo(data,userId) {

    const newTodo = Todos.create({
        Title: data.Title,
        Description: data.Description,
        Location: data.Location,
        Address: data.Address,
        DateTime: data.DateTime,
        Level: data.Level,
        Picture:data.Picture,
        userId:userId
        // createdAt: { type: Date, default: Date.now },
        // userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        // updatedAt: Date
    })
    return newTodo
}

async function deletetodo(id) {
    const deleted = await Todos.findByIdAndDelete(id)
    return !!deleted
}

async function patchtodo(id, updates) {
    updates.updatedAt = new Date();
    const updatedTodo = await Todos.findByIdAndUpdate(id, updates, { new: true });
    return updatedTodo;
}
async function searchtodos(query,userId) {
    if (!query) return res.json({ data: [] });

   
    const todos = await Todos.find({
      userId,
      Title: { $regex: query, $options: "i" },
    }).sort({ createdAt: -1 })

    return todos
}
module.exports = {
    gettodos,
    createtodo,
    deletetodo,
    patchtodo,
    getAlltodos,
    searchtodos
}
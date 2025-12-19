const { createChatSession, sendMessageStream } = require("../services/chat.service");
const todoService = require("../services/todo.service");

const sendMessage = async (req, res) => {
  const { message, userId } = req.body;
  
  if (!message || !userId)
    return res.status(400).json({ error: "Message and userId are required" });
  
  try {
    // ✅ Fetch ALL todos ONCE at the start
    const todosResult = await todoService.gettodos(1, 100, userId);
    const allTodos = todosResult.data || [];
    
    console.log("📝 User has", allTodos.length, "todos");
    
    // Create chat with todos already in context
    const chat = createChatSession(allTodos);
    
    let accumulatedText = "";
    
    try {
      for await (const chunk of sendMessageStream(chat, message, userId, allTodos)) {
        console.log("📦 Chunk received:", chunk);
        accumulatedText += chunk.text || "";
      }
    } catch (streamError) {
      console.error("❌ Stream error:", streamError);
      throw streamError;
    }
    
    console.log("✅ Final accumulated text:", accumulatedText);
    res.json({ text: accumulatedText });
    
  } catch (err) {
    console.error("❌ Chat error:", err);
    console.error("❌ Error stack:", err.stack);
    res.status(500).json({ 
      error: "Something went wrong while processing the chat",
      details: err.message 
    });
  }
};

module.exports = { sendMessage };
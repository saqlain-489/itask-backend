const { GoogleGenerativeAI } = require("@google/generative-ai");
const todoService = require("./todo.service");
const { parseISO, addDays, isValid } = require("date-fns");

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Try these models in order until one works:
// const MODEL_NAME = "gemini-pro"; 
const MODEL_NAME = "gemini-1.5-flash";
// const MODEL_NAME = "gemini-1.5-pro";

// Uncomment this function and call it once to see available models:
async function listAvailableModels() {
  try {
    const models = await genAI.listModels();
    console.log("📋 Available models:");
    models.forEach(model => {
      console.log(`  - ${model.name}`);
    });
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}
listAvailableModels(); 

// Define available tools for the AI
const tools = [
  {
    functionDeclarations: [
      {
        name: "create_todo",
        description: "Create a new todo for the user. ONLY use this when user explicitly asks to create/add a new todo.",
        parameters: {
          type: "object",
          properties: {
            title: { 
              type: "string", 
              description: "Title of the todo" 
            },
            description: { 
              type: "string", 
              description: "Description of the todo" 
            },
            dateTime: { 
              type: "string", 
              description: "Datetime in ISO 8601 format (e.g., 2024-12-25T17:00:00)." 
            },
          },
          required: ["title"],
        },
      },
    ],
  },
];

// Function implementations
const functions = {
  create_todo: async ({ title, description, dateTime }, userId) => {
    try {
      let finalDateTime;

      if (dateTime) {
        try {
          finalDateTime = parseISO(dateTime);
          if (!isValid(finalDateTime)) {
            console.warn("Invalid date provided, using current date");
            finalDateTime = new Date();
          }
        } catch (err) {
          console.error("Date parsing error:", err);
          finalDateTime = new Date();
        }
      } else {
        finalDateTime = new Date();
      }

      const todoData = {
        Title: title,
        Description: description || "",
        DateTime: finalDateTime,
      };

      const newTodo = await todoService.createtodo(todoData, userId);
      
      return { 
        success: true,
        todo: newTodo,
        message: `Todo "${title}" created successfully for ${finalDateTime.toLocaleString()}`
      };
    } catch (error) {
      console.error("Error creating todo:", error);
      return { 
        success: false, 
        error: error.message || "Failed to create todo"
      };
    }
  },
};

/**
 * Create a new chat session with context about user's todos
 */
const createChatSession = (userTodos = []) => {
  const todosContext = userTodos.length > 0
    ? userTodos.map((todo, idx) => 
        `${idx + 1}. Title: "${todo.Title || 'Untitled'}", Description: "${todo.Description || 'N/A'}", DateTime: ${todo.DateTime || 'N/A'}, Status: ${todo.Status || 'pending'}`
      ).join('\n')
    : "No todos found.";

  const currentDate = new Date();
  const tomorrow = addDays(currentDate, 1);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `You are an AI assistant for a Todo App. 

Current Date and Time: ${currentDate.toISOString()}
Tomorrow's Date: ${tomorrow.toISOString().split('T')[0]}

USER'S ALL TODOS:
${todosContext}

IMPORTANT INSTRUCTIONS:
- You have ALL the user's todos listed above in your context
- When user asks questions about their todos (count, search, filter, etc.), answer DIRECTLY from the context above
- DO NOT call any function to search or fetch todos - they are already provided
- ONLY use the create_todo function when the user explicitly wants to create/add a new todo
- Be conversational and helpful

DATE/TIME HANDLING FOR NEW TODOS:
When user mentions time/date, convert to ISO 8601 format (YYYY-MM-DDTHH:MM:SS):
- "5pm tomorrow" → Tomorrow's date at 17:00:00 (e.g., ${tomorrow.toISOString().split('T')[0]}T17:00:00)
- "10am today" → Today at 10:00:00 (e.g., ${currentDate.toISOString().split('T')[0]}T10:00:00)
- "tomorrow" without time → Tomorrow at 09:00:00
- No time mentioned → Current time`,
    tools,
  });

  return model.startChat({
    history: [],
  });
};

/**
 * Send a message and stream the response
 */
async function* sendMessageStream(chat, message, userId, allTodos = []) {
  try {
    if (!chat) {
      throw new Error("Chat session is not initialized");
    }

    if (!message || typeof message !== 'string') {
      throw new Error("Invalid message provided");
    }

    console.log("🚀 Starting stream for message:", message);
    
    const result = await chat.sendMessageStream(message);
    
    console.log("📡 Stream result received");

    for await (const chunk of result.stream) {
      console.log("📦 Processing chunk...");
      
      // Handle function calls
      const functionCalls = chunk.functionCalls?.() || [];
      
      if (functionCalls.length > 0) {
        console.log("🔧 Function calls detected:", functionCalls);
        
        for (const call of functionCalls) {
          const fn = functions[call.name];
          
          if (fn) {
            try {
              console.log(`⚙️ Executing function: ${call.name}`);
              const apiResult = await fn(call.args, userId);

              // Send function response back to the model
              const functionResponseResult = await chat.sendMessage([{
                functionResponse: {
                  name: call.name,
                  response: apiResult,
                },
              }]);

              const responseText = functionResponseResult.response.text();
              console.log("✅ Function response:", responseText);
              
              if (responseText) {
                yield { text: responseText };
              }
              
            } catch (error) {
              console.error(`❌ Error executing function ${call.name}:`, error);
              
              // Send error response back to model
              const errorResult = await chat.sendMessage([{
                functionResponse: {
                  name: call.name,
                  response: { 
                    success: false, 
                    error: error.message || "Function execution failed"
                  },
                },
              }]);

              const errorText = errorResult.response.text();
              if (errorText) {
                yield { text: errorText };
              }
            }
          } else {
            console.warn(`⚠️ Unknown function called: ${call.name}`);
          }
        }
      } else {
        // Handle regular text chunks
        try {
          const text = chunk.text();
          console.log("💬 Text chunk:", text);
          
          if (text && text.trim()) {
            yield { text };
          }
        } catch (textError) {
          console.error("❌ Error getting text from chunk:", textError);
          
          // Attempt to extract any available text from the chunk
          if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
            const fallbackText = chunk.candidates[0].content.parts[0].text;
            console.log("💬 Fallback text extracted:", fallbackText);
            yield { text: fallbackText };
          }
        }
      }
    }
    
    console.log("✅ Stream completed successfully");
    
  } catch (error) {
    console.error("❌ Stream error:", error);
    console.error("❌ Error stack:", error.stack);
    
    // Yield error message to client
    yield { 
      text: "I apologize, but I encountered an error processing your request. Please try again.",
      error: true 
    };
  }
} 

module.exports = { 
  createChatSession, 
  sendMessageStream 
};
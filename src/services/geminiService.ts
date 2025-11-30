import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMentorResponse = async (
  history: { role: 'user' | 'model', content: string }[],
  lastMessage: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Construct a prompt that encourages Socratic method
    const systemInstruction = `You are a senior Guidewire developer and mentor for students at InTime Academy. 
    Your goal is to help students master Guidewire PolicyCenter development.
    Use the Socratic method: ask guiding questions rather than giving direct answers immediately.
    Encourage critical thinking.
    Be encouraging but maintain high standards.
    If the user asks for code, ask them what they think the first step is.
    Keep responses concise and conversational.`;

    const model = "gemini-2.5-flash";
    
    // Simple history management for this demo (concat last few messages)
    const recentHistory = history.slice(-5).map(msg => `${msg.role === 'user' ? 'Student' : 'Mentor'}: ${msg.content}`).join('\n');
    const fullPrompt = `${recentHistory}\nStudent: ${lastMessage}\nMentor:`;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction,
      }
    });
    
    return response.text || "I'm pondering that... can you rephrase?";
  } catch (error) {
    console.error("Error generating mentor response:", error);
    return "I'm having trouble connecting to the knowledge base right now. What do you think might be the issue?";
  }
};

export const generateCollaboratorResponse = async (
  history: { role: 'user' | 'model', content: string }[],
  lastMessage: string
): Promise<string> => {
  try {
    const ai = getAIClient();
    
    // Fellow Developer / Senior Colleague Persona
    const systemInstruction = `You are a Senior Guidewire Developer working alongside the user (a junior developer) on a project called 'HomeProtect'.
    
    Role: Senior Colleague / Pair Programmer.
    Tone: Professional, direct, helpful, and technical. NOT Socratic. Give the answer if asked, but explain WHY.
    Context: 
    - We are implementing PolicyCenter 10.
    - We use Gosu for business logic.
    - We are currently in Sprint 2 (Configuration).
    
    If the user shares code, debug it and show the corrected snippet.
    If the user asks about architecture, explain the best practice pattern (e.g. "Always use the Builder pattern for tests").
    `;

    const model = "gemini-2.5-flash";
    
    const recentHistory = history.slice(-10).map(msg => `${msg.role === 'user' ? 'Junior' : 'Senior'}: ${msg.content}`).join('\n');
    const fullPrompt = `${recentHistory}\nJunior: ${lastMessage}\nSenior:`;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction,
      }
    });
    
    return response.text || "Let me check the documentation on that...";
  } catch (error) {
    console.error("Error generating collaborator response:", error);
    return "I'm having trouble accessing the dev server (AI API Error). Check your connection.";
  }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAIClient();
  const model = "gemini-2.5-flash-image";

  // Remove header if present (e.g., "data:image/png;base64,")
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/png', 
          },
        },
        {
          text: prompt || "Enhance this image for a professional portfolio.",
        },
      ],
    },
  });

  // Iterate parts to find image
  if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              return `data:image/png;base64,${part.inlineData.data}`;
          }
      }
  }
  
  throw new Error("No image generated");
};

export const generateVideo = async (base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
  const ai = getAIClient();
  const model = "veo-3.1-fast-generate-preview";

  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  let operation = await ai.models.generateVideos({
    model,
    prompt: prompt || "Animate this scene cinematically",
    image: {
        imageBytes: cleanBase64,
        mimeType: 'image/png', 
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({operation: operation});
    console.log("Video generation status:", operation.metadata);
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("No video URI returned");

  // Fetch the actual video bytes (proxying through the URI provided)
  // We need to append the API key to the fetch URL as per docs
  const videoUrlWithKey = `${videoUri}&key=${process.env.API_KEY}`;
  
  return videoUrlWithKey;
};
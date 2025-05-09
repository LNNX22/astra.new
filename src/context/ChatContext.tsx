import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Chat, Message } from "@/types/chat";
import { createMessage, createNewChat, updateChatTitle, createFileMessage } from "@/utils/chat-utils";
import { callGeminiAPI, getEnvApiKey, callGeminiAPIWithFile } from "@/services/gemini-api";

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  apiKey: string;
  isLoading: boolean;
  setApiKey: (key: string) => void;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  sendFileMessage: (file: File, description?: string) => Promise<void>;
  clearChats: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [apiKey, setApiKey] = useState(getEnvApiKey());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedChats = localStorage.getItem("gemini-chats");
    const storedApiKey = localStorage.getItem("gemini-api-key");
    
    if (storedChats) {
      try {
        const parsedChats = JSON.parse(storedChats);
        setChats(parsedChats);
        
        // Set the most recent chat as current if available
        if (parsedChats.length > 0) {
          const sortedChats = [...parsedChats].sort((a, b) => b.updatedAt - a.updatedAt);
          setCurrentChat(sortedChats[0]);
        }
      } catch (error) {
        console.error("Failed to parse stored chats:", error);
      }
    }
    
    // Only use stored API key if no env variable is set
    if (!apiKey && storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("gemini-chats", JSON.stringify(chats));
  }, [chats]);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if it's not from an env variable
    if (apiKey !== getEnvApiKey() || !getEnvApiKey()) {
      localStorage.setItem("gemini-api-key", apiKey);
    }
  }, [apiKey]);

  const handleCreateNewChat = () => {
    const newChat = createNewChat();
    setChats(prevChats => [newChat, ...prevChats]);
    setCurrentChat(newChat);
  };

  const selectChat = (chatId: string) => {
    const selected = chats.find(chat => chat.id === chatId);
    if (selected) {
      setCurrentChat(selected);
    }
  };

  const deleteChat = (chatId: string) => {
    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
    
    if (currentChat?.id === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      setCurrentChat(remainingChats.length > 0 ? remainingChats[0] : null);
    }
  };

  const clearChats = () => {
    setChats([]);
    setCurrentChat(null);
  };

  const sendMessage = async (content: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in settings",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new chat if there isn't one
    if (!currentChat) {
      handleCreateNewChat();
    }
    
    const userMessage = createMessage(content, "user");
    
    // Update the current chat with the user message
    const updatedChat = currentChat ? {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      updatedAt: Date.now()
    } : createNewChat();
    
    // If we just created a new chat, add the user message
    if (!currentChat) {
      updatedChat.messages = [userMessage];
    }
    
    // Set the updated chat as the current chat and update the chats array
    setCurrentChat(updatedChat);
    setChats(prevChats => {
      const index = prevChats.findIndex(chat => chat.id === updatedChat.id);
      if (index !== -1) {
        const newChats = [...prevChats];
        newChats[index] = updatedChat;
        return newChats;
      }
      return [updatedChat, ...prevChats];
    });
    
    // Call the Gemini API
    try {
      setIsLoading(true);
      
      const aiResponse = await callGeminiAPI(content, apiKey);
      const aiMessage = createMessage(aiResponse, "ai");
      
      // Update the chat with the AI response
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: Date.now()
      };
      
      // Update the title if it's a new chat
      const titledChat = updateChatTitle(finalChat);
      
      setCurrentChat(titledChat);
      setChats(prevChats => {
        const index = prevChats.findIndex(chat => chat.id === titledChat.id);
        if (index !== -1) {
          const newChats = [...prevChats];
          newChats[index] = titledChat;
          return newChats;
        }
        return [titledChat, ...prevChats];
      });
      
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      toast({
        title: "API Error",
        description: "Failed to get a response from Gemini API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendFileMessage = async (file: File, description?: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key in settings",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new chat if there isn't one
    if (!currentChat) {
      handleCreateNewChat();
    }
    
    // Create a file message with the optional description
    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
    const fileName = file.name;
    const content = description || `Uploaded ${fileType}: ${fileName}`;
    const fileMessage = createFileMessage(file, fileType, fileName, content);
    
    // Update the current chat with the file message
    const updatedChat = currentChat ? {
      ...currentChat,
      messages: [...currentChat.messages, fileMessage],
      updatedAt: Date.now()
    } : createNewChat();
    
    // If we just created a new chat, add the file message
    if (!currentChat) {
      updatedChat.messages = [fileMessage];
    }
    
    // Set the updated chat as the current chat and update the chats array
    setCurrentChat(updatedChat);
    setChats(prevChats => {
      const index = prevChats.findIndex(chat => chat.id === updatedChat.id);
      if (index !== -1) {
        const newChats = [...prevChats];
        newChats[index] = updatedChat;
        return newChats;
      }
      return [updatedChat, ...prevChats];
    });
    
    // Call the Gemini API with the file
    try {
      setIsLoading(true);
      
      const fileContent = await file.arrayBuffer();
      const fileBase64 = btoa(
        new Uint8Array(fileContent).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      // Use the provided description as the prompt
      const prompt = description || (fileType === 'image' 
        ? "Analyze this image and describe what you see in detail."
        : "Analyze the content of this PDF and provide a detailed summary.");
      
      console.log("Using prompt for file analysis:", prompt);
      
      const aiResponse = await callGeminiAPIWithFile(prompt, apiKey, fileBase64, fileType, file.type);
      const aiMessage = createMessage(aiResponse, "ai");
      
      // Update the chat with the AI response
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
        updatedAt: Date.now()
      };
      
      // Update the title if it's a new chat
      const titledChat = updateChatTitle(finalChat);
      
      setCurrentChat(titledChat);
      setChats(prevChats => {
        const index = prevChats.findIndex(chat => chat.id === titledChat.id);
        if (index !== -1) {
          const newChats = [...prevChats];
          newChats[index] = titledChat;
          return newChats;
        }
        return [titledChat, ...prevChats];
      });
      
    } catch (error) {
      console.error("Error calling Gemini API with file:", error);
      toast({
        title: "API Error",
        description: "Failed to analyze the file. The file might be too large or in an unsupported format.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    chats,
    currentChat,
    apiKey,
    isLoading,
    setApiKey,
    createNewChat: handleCreateNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    sendFileMessage,
    clearChats
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};

export { getEnvApiKey };

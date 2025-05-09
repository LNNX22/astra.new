
import { Chat, Message, FileMessage } from "@/types/chat";

export const createMessage = (content: string, role: "user" | "ai"): Message => {
  return {
    id: crypto.randomUUID(),
    content,
    role,
    timestamp: Date.now()
  };
};

export const createFileMessage = (file: File, fileType: "image" | "pdf", fileName: string, content?: string): FileMessage => {
  const fileUrl = URL.createObjectURL(file);
  return {
    id: crypto.randomUUID(),
    content: content || `Uploaded ${fileType}: ${fileName}`,
    role: "user",
    timestamp: Date.now(),
    fileType,
    fileName,
    fileUrl
  };
};

export const createNewChat = (): Chat => {
  return {
    id: crypto.randomUUID(),
    title: "New Chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};

export const updateChatTitle = (chat: Chat): Chat => {
  // Update the title based on the first user message if it's "New Chat"
  if (chat.title === "New Chat" && chat.messages.length > 0) {
    const firstUserMessage = chat.messages.find(m => m.role === "user");
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "");
      return {
        ...chat,
        title
      };
    }
  }
  return chat;
};

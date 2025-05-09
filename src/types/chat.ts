
export type Message = {
  id: string;
  content: string;
  role: "user" | "ai";
  timestamp: number;
};

export type FileMessage = Message & {
  fileType: "image" | "pdf";
  fileName: string;
  fileUrl: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: (Message | FileMessage)[];
  createdAt: number;
  updatedAt: number;
};

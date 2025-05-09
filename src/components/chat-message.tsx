
import { Message, FileMessage } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { FileText, Image } from "lucide-react";

interface ChatMessageProps {
  message: Message | FileMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAi = message.role === "ai";
  const isFileMessage = 'fileType' in message;
  
  return (
    <div className={cn(
      "flex items-start gap-3 mb-4",
      isAi ? "" : "flex-row-reverse"
    )}>
      <Avatar className={cn(
        "h-8 w-8",
        isAi ? "bg-gemini-purple/10" : "bg-primary/10"
      )}>
        <AvatarFallback className={cn(
          "text-sm",
          isAi ? "text-gemini-purple" : "text-primary"
        )}>
          {isAi ? "AS" : "U"}
        </AvatarFallback>
        {isAi && <AvatarImage src="/logo.png" />}
      </Avatar>
      <div
        className={cn(
          "max-w-[80%]",
          isAi ? "message-ai" : "message-user"
        )}
      >
        {isFileMessage ? (
          <div className="flex flex-col">
            <div className="mb-2 text-sm text-muted-foreground">
              {message.content}
            </div>
            {(message as FileMessage).fileType === "image" ? (
              <div className="rounded-md overflow-hidden border border-border">
                <img 
                  src={(message as FileMessage).fileUrl} 
                  alt={(message as FileMessage).fileName}
                  className="max-w-full max-h-60 object-contain"
                />
              </div>
            ) : (
              <a 
                href={(message as FileMessage).fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <FileText className="h-8 w-8 text-destructive" />
                <div>
                  <div className="font-medium">{(message as FileMessage).fileName}</div>
                  <div className="text-xs text-muted-foreground">Click to open PDF</div>
                </div>
              </a>
            )}
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );
}

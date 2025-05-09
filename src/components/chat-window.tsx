
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/context/ChatContext";
import ChatMessage from "@/components/chat-message";
import { Card } from "@/components/ui/card";
import { Lightbulb, BookOpen, MessageCircle, MessageSquare } from "lucide-react";

export default function ChatWindow() {
  const { currentChat, isLoading, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChat?.messages]);
  
  const chatSuggestions = [
    {
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      title: "Creative Ideas",
      prompt: "Give me creative ideas for a sci-fi short story"
    },
    {
      icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
      title: "Learn Something",
      prompt: "Explain quantum computing in simple terms"
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-sky-500" />,
      title: "Get Advice",
      prompt: "What are some effective time management techniques?"
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      title: "Code Help",
      prompt: "Help me write a function to calculate Fibonacci numbers in JavaScript"
    }
  ];
  
  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  if (!currentChat || currentChat.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-3xl w-full">
          <div className="text-6xl font-bold bg-gradient-to-r from-gemini-purple to-gemini-blue bg-clip-text text-transparent mb-4">
            Astra AI
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Ask me anything about code, data, or general knowledge. 
            I'm here to help with your questions!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {chatSuggestions.map((suggestion, index) => (
              <Card 
                key={index}
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors flex items-start gap-3 hover:scale-[1.02] hover:shadow-md duration-200"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
              >
                <div className="p-2 rounded-md bg-muted/50">
                  {suggestion.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground">{suggestion.prompt}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="pb-4">
        {currentChat.messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-gemini-purple/10 flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-gemini-purple/30"></div>
            </div>
            <div className="message-ai flex items-center">
              <div className="astra-wave-loader">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

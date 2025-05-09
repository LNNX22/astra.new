import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/context/ChatContext";
import { MessageSquare, Settings, History, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Sidebar() {
  const location = useLocation();
  const { chats, currentChat, createNewChat, selectChat, deleteChat } = useChatContext();
  
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          <span className="bg-gradient-to-r from-gemini-purple to-gemini-blue bg-clip-text text-transparent">
            Astra AI
          </span>
        </h1>
        <Button 
          onClick={createNewChat} 
          className="w-full mt-4 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
        >
          <Plus size={16} className="mr-2" /> New Chat
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />
      
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1 mb-4">
          <h2 className="text-sidebar-foreground/60 text-xs font-medium px-2 py-1">RECENT CHATS</h2>
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant={currentChat?.id === chat.id ? "secondary" : "ghost"}
              className="w-full justify-start text-sidebar-foreground/90 hover:text-sidebar-foreground group"
              onClick={() => selectChat(chat.id)}
            >
              <div className="truncate flex-1 text-left">
                <div className="font-medium truncate">{chat.title}</div>
                <div className="text-xs text-sidebar-foreground/60">
                  {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                </div>
              </div>
              <Trash2 
                size={14} 
                className="ml-2 opacity-0 group-hover:opacity-100 text-sidebar-foreground/60 hover:text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
              />
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      
      <nav className="p-4 space-y-2">
        <Link to="/">
          <Button 
            variant={location.pathname === "/" ? "secondary" : "ghost"} 
            className="w-full justify-start"
          >
            <MessageSquare size={16} className="mr-2" /> Chat
          </Button>
        </Link>
        <Link to="/history">
          <Button 
            variant={location.pathname === "/history" ? "secondary" : "ghost"} 
            className="w-full justify-start"
          >
            <History size={16} className="mr-2" /> History
          </Button>
        </Link>
        <Link to="/settings">
          <Button 
            variant={location.pathname === "/settings" ? "secondary" : "ghost"} 
            className="w-full justify-start"
          >
            <Settings size={16} className="mr-2" /> Settings
          </Button>
        </Link>
      </nav>
    </div>
  );
}

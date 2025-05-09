
import { useChatContext } from "@/context/ChatContext";
import Layout from "@/components/layout";
import ChatInput from "@/components/chat-input";
import ChatWindow from "@/components/chat-window";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const { apiKey } = useChatContext();
  
  return (
    <Layout>
      <div className="flex flex-col h-full">
        {!apiKey && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">API Key Required</p>
              <p className="text-sm">
                Please add your Gemini API key in the{" "}
                <Link to="/settings" className="underline font-medium">
                  settings
                </Link>{" "}
                or set the <code className="bg-destructive/20 px-1 rounded">VITE_GEMINI_API_KEY</code> environment variable.
              </p>
            </div>
          </div>
        )}
        
        <ChatWindow />
        
        <div className="mt-4">
          <ChatInput />
        </div>
      </div>
    </Layout>
  );
};

export default Index;

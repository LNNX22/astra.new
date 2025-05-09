
import { useState, FormEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image, FileText } from "lucide-react";
import { useChatContext } from "@/context/ChatContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const { sendMessage, isLoading, sendFileMessage } = useChatContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDescription, setFileDescription] = useState("");
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await sendMessage(input);
    setInput("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validFileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFileTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF or image files only (JPG, PNG, GIF, WebP)",
        variant: "destructive"
      });
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setFileDialogOpen(true);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAttachmentClick = (type: 'image' | 'pdf') => {
    fileInputRef.current?.click();
  };

  const handleSendFile = async () => {
    if (!selectedFile) return;
    
    try {
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'PDF';
      const description = fileDescription || `Analyze this ${fileType}`;
      
      console.log("Sending file with description:", description);
      await sendFileMessage(selectedFile, description);
      closeFileDialog();
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: "Failed to process the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const closeFileDialog = () => {
    setFileDialogOpen(false);
    setSelectedFile(null);
    setFileDescription("");
  };
  
  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="border rounded-xl p-2 bg-background shadow-sm">
        <div className="flex items-end">
          <Textarea 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyDown}
            placeholder="Ask Astra anything..." 
            className="flex-1 min-h-10 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
          <div className="flex items-center gap-2 ml-2">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="rounded-full h-8 w-8" 
              onClick={() => handleAttachmentClick('pdf')}
              disabled={isLoading}
            >
              <FileText size={16} className="text-muted-foreground" />
            </Button>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="rounded-full h-8 w-8" 
              onClick={() => handleAttachmentClick('image')}
              disabled={isLoading}
            >
              <Image size={16} className="text-muted-foreground" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full h-8 w-8" 
              disabled={!input.trim() || isLoading}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </form>
      <div className="text-xs text-muted-foreground text-center">
        Astra may make mistakes. It's best to double check its responses.
      </div>

      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload {selectedFile?.type.startsWith('image/') ? 'Image' : 'PDF'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedFile?.type.startsWith('image/') && (
              <div className="flex justify-center">
                <img 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : ''} 
                  alt="Preview" 
                  className="max-h-40 object-contain rounded-md"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="file-description">Instructions for AI</Label>
              <Input
                id="file-description"
                placeholder={`What would you like to ask about this ${selectedFile?.type.startsWith('image/') ? 'image' : 'PDF'}?`}
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter specific instructions for the AI (e.g., "Edit this image by..." or "Summarize this PDF")
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={closeFileDialog} type="button">
              Cancel
            </Button>
            <Button onClick={handleSendFile} type="button" disabled={isLoading}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

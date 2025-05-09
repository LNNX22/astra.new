
import { useChatContext } from "@/context/ChatContext";
import Layout from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2 } from "lucide-react";

const ChatHistory = () => {
  const { chats, selectChat, deleteChat, clearChats } = useChatContext();
  
  if (chats.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2" /> Chat History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">No chat history found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2" /> Chat History
          </CardTitle>
          <Button variant="destructive" size="sm" onClick={clearChats}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chats.map((chat) => (
                <TableRow key={chat.id}>
                  <TableCell className="font-medium">{chat.title}</TableCell>
                  <TableCell>{chat.messages.length}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => selectChat(chat.id)}>
                      Open
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteChat(chat.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ChatHistory;

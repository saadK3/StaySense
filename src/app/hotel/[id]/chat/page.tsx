"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getHotelData } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon, Sparkles } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const hotelId = params?.id as string;
  const data = getHotelData(hotelId);
  
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    if (data.hotel) {
      setMessages(data.chatHistory);
    }
  }, [data.chatHistory, data.hotel]);

  if (!data.hotel) return <div className="p-8 text-center text-muted-foreground">Hotel not found.</div>;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    // Add user message
    const newChat = [...messages, { role: "user", content: inputVal }];
    setMessages(newChat);
    setInputVal("");

    // Mock AI response
    setTimeout(() => {
      setMessages([...newChat, { role: "ai", content: `I am analyzing ${data.hotel?.name}'s review data for that request. It seems there's a strong correlation with recent staffing changes on weekends. Generating a detailed report... (Mock Response)` }]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">StaySense AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Talk to {data.hotel.name}'s data in natural language.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full border-border shadow-md rounded-2xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-secondary/20">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${
                msg.role === 'user' 
                ? 'bg-foreground text-background rounded-tr-sm' 
                : 'bg-card text-card-foreground border border-border rounded-tl-sm'
              }`}>
                <p className="leading-relaxed text-sm">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              )}

            </div>
          ))}
        </div>

        <div className="p-4 bg-card border-t border-border">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input 
              className="pr-12 py-6 rounded-full bg-secondary/50 border-border focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
              placeholder={`Ask about ${data.hotel.name}'s latest reviews or insights...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1.5 rounded-full w-9 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!inputVal.trim()}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-3 font-serif">
            StaySense AI can make mistakes. Consider verifying critical business decisions.
          </p>
        </div>
      </Card>
    </div>
  );
}


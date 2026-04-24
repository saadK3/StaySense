"use client";

import { useParams } from "next/navigation";
import { getHotelData } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Factory, Wifi, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RecommendationsPage() {
  const params = useParams();
  const hotelId = params?.id as string;
  const data = getHotelData(hotelId);

  if (!data.hotel) return <div className="p-8 text-center text-muted-foreground">Hotel not found.</div>;

  const { hotel, aiRecommendations } = data;
  
  const getIcon = (id: string) => {
    switch(id) {
      case "r1": return <Factory className="w-6 h-6 text-primary" />;
      case "r2": return <Wifi className="w-6 h-6 text-primary" />;
      case "r3": return <Users className="w-6 h-6 text-primary" />;
      default: return <Sparkles className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading flex items-center gap-2">
          {hotel.name} AI Recommendations
          <Sparkles className="w-6 h-6 text-primary ml-2 animate-pulse" />
        </h1>
        <p className="text-muted-foreground mt-1">Actionable steps generated from {hotel.name}'s sentiment analysis to improve ROI.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 max-w-4xl">
        {aiRecommendations.map((rec) => (
          <Card key={rec.id} className="border-l-4" style={{borderLeftColor: 'var(--color-primary)'}}>
            <CardHeader className="pb-2 flex flex-row items-start gap-4">
              <div className="p-3 bg-muted rounded-lg shadow-sm">
                {getIcon(rec.id)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-heading">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">Target: {rec.hotel}</CardDescription>
                  </div>
                  <Badge variant={rec.priority === "High" ? "destructive" : "secondary"}>
                    {rec.priority} Priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-16">
              <p className="text-muted-foreground">{rec.description}</p>
              
              <div className="mt-4 p-4 bg-primary/5 text-primary rounded-lg border border-primary/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold text-sm">Estimated ROI: {rec.roiEstimate}</span>
              </div>
            </CardContent>
            <CardFooter className="ml-16 pt-0 gap-3">
              <Button>Create Task in Jira</Button>
              <Button variant="outline">Dismiss</Button>
            </CardFooter>
          </Card>
        ))}
        {aiRecommendations.length === 0 && (
          <div className="text-muted-foreground py-10">No specific recommendations at this time.</div>
        )}
      </div>
    </div>
  );
}


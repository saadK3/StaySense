"use client";

import { useParams } from "next/navigation";
import { getHotelData } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, Users, Star, TrendingDown, Sparkles, AlertOctagon, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const params = useParams();
  const hotelId = params?.id as string;
  const data = getHotelData(hotelId);

  if (!data.hotel) {
    return <div className="p-8 text-center text-muted-foreground">Hotel not found.</div>;
  }

  const { hotel, stats, ratingTrends, sentimentScores, commonIssues, aiRecommendations } = data;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 fade-in-up pb-16 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{hotel.name} Insights</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">{hotel.location} • {hotel.rooms} Rooms</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto">Export PDF</Button>
          <Button className="w-full md:w-auto flex items-center pr-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold font-heading">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-primary flex items-center mr-1 font-medium"><ArrowUpRight className="w-3 h-3 mr-0.5"/> 0.2</span>
              from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold font-heading">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-primary flex items-center mr-1 font-medium"><ArrowUpRight className="w-3 h-3 mr-0.5"/> 12%</span>
              volume increase
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Net Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold font-heading">{stats.netSentiment}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Positive overall sentiment
            </p>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium text-primary">Critical Issues</CardTitle>
            <AlertOctagon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold font-heading text-foreground">{stats.criticalIssues}</div>
            <p className="text-xs text-primary mt-1 font-medium">
              Requires immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Rating Trends</CardTitle>
            <CardDescription>Average review score over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 12}} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '14px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                  cursor={{stroke: 'var(--color-muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3'}}
                />
                <Line type="monotone" dataKey="rating" stroke="var(--color-primary)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-primary)'}} activeDot={{ r: 8, fill: 'var(--color-primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Sentiment by Category</CardTitle>
            <CardDescription>NLP analysis of keyword themes</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={sentimentScores} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: 'var(--color-muted-foreground)', fontSize: 12}} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--color-foreground)', fontWeight: 500, fontSize: 12}} />
                <Tooltip cursor={{fill: 'var(--color-muted)', opacity: 0.2}} contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', fontSize: '14px' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {sentimentScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

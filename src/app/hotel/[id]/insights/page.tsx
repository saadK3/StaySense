"use client";

import { useParams } from "next/navigation";
import { getHotelData } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingDown, TrendingUp, AlertOctagon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InsightsPage() {
  const params = useParams();
  const hotelId = params?.id as string;
  const data = getHotelData(hotelId);

  if (!data.hotel) return <div className="p-8 text-center text-muted-foreground">Hotel not found.</div>;

  const { hotel, commonIssues } = data;

  const topIssue = commonIssues.length > 0 ? commonIssues[0] : null;

  return (
    <div className="flex-1 p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">{hotel.name} Issues & Insights</h1>
        <p className="text-muted-foreground mt-1">AI-extracted negative trends affecting {hotel.name}'s health.</p>
      </div>

      {topIssue && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-destructive/10 border-destructive/20 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive text-sm font-medium flex items-center gap-2">
                <AlertOctagon className="w-4 h-4"/>
                Most Critical Issue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{topIssue.issue}</div>
              <p className="text-xs text-muted-foreground mt-1">Driving {topIssue.impactScore.toFixed(1)} impact on score</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Extracted Issues</CardTitle>
          <CardDescription>Based on sentiment analysis of reviews with rating &lt;= 3.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue Theme</TableHead>
                <TableHead>Mentions (30d)</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Impact Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commonIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.issue}</TableCell>
                  <TableCell>{issue.count}</TableCell>
                  <TableCell>
                    {issue.trend === "up" ? (
                      <Badge variant="destructive" className="flex w-fit items-center"><TrendingUp className="w-3 h-3 mr-1" /> Rising</Badge>
                    ) : issue.trend === "down" ? (
                      <Badge variant="outline" className="text-primary border-primary flex w-fit items-center"><TrendingDown className="w-3 h-3 mr-1" /> Falling</Badge>
                    ) : (
                      <Badge variant="secondary">Stable</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    {issue.impactScore.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


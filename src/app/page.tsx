"use client";

import { useMemo, useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ExtractedPreferences = {
  city: string | null;
  area: string | null;
  priorities: string[];
  concerns: string[];
};

type RankedHotel = {
  id: string;
  name: string;
  city: string;
  area: string;
  price_per_night: number;
  rating: number;
  amenities: string[];
  cleanliness_score: number;
  service_score: number;
  location_score: number;
  wifi_score: number;
  parking_score: number;
  value_score: number;
  match_score: number;
  reason_codes: string[];
};

type ComparisonRow = {
  hotel_id: string;
  hotel_name: string;
  price_per_night: number;
  rating: number;
  cleanliness_score: number;
  service_score: number;
  location_score: number;
  wifi_score: number;
  parking_score: number;
  value_score: number;
  match_score: number;
};

type RecommendationResponse = {
  extracted_preferences: ExtractedPreferences;
  ranked_hotels: RankedHotel[];
  comparison_data: ComparisonRow[];
  recommendation_summary: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function LandingSearchPage() {
  const [query, setQuery] = useState("I need a clean hotel in Lahore near Gulberg with parking");
  const [results, setResults] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasNoResults = useMemo(() => {
    return results !== null && results.ranked_hotels.length === 0;
  }, [results]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter your hotel requirements before searching.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/recommendations/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Backend request failed with status ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();
      setResults(data);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to fetch recommendations.";
      setError(`Could not fetch recommendations: ${message}`);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-full bg-background flex flex-col items-center p-6 md:p-8 fade-in-up relative">
      
      {/* Background Silhouette SVG */}
      <svg viewBox="0 0 1000 200" className="absolute bottom-0 left-0 w-full min-w-[800px] h-auto opacity-[0.03] text-foreground fill-current pointer-events-none z-0" preserveAspectRatio="none">
        <path d="M0,200 L0,150 L50,150 L50,80 L100,80 L100,180 L150,180 L150,100 L180,100 L180,50 L220,50 L220,160 L270,160 L270,120 L300,120 L300,180 L350,180 L350,90 L400,90 L400,40 L450,40 L450,170 L500,170 L500,110 L540,110 L540,60 L580,60 L580,140 L630,140 L630,70 L680,70 L680,160 L720,160 L720,100 L760,100 L760,40 L810,40 L810,130 L850,130 L850,80 L900,80 L900,150 L950,150 L950,90 L1000,90 L1000,200 Z" />
      </svg>

      <div className="max-w-5xl w-full text-center space-y-6 relative z-10 py-6 md:py-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
             <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-heading">
          StaySense AI
        </h1>
        <p className="text-lg text-muted-foreground font-serif max-w-2xl mx-auto">
          Describe what you need and get extracted preferences, ranked options, side-by-side comparison, and a recommendation summary.
        </p>

        <div className="pt-8 relative max-w-3xl mx-auto">
          <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-primary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
             <div className="relative flex items-center gap-2 bg-background rounded-full p-2 shadow-lg">
                <Search className="absolute left-6 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input 
                  className="pl-14 pr-4 py-8 text-lg rounded-full bg-background border-border focus-visible:ring-primary placeholder:text-muted-foreground/70"
                  placeholder="I need a clean hotel in Lahore near Gulberg with parking" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleSearch();
                    }
                  }}
                />
                <Button
                  className="rounded-full px-5 shrink-0"
                  size="lg"
                  onClick={() => void handleSearch()}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Find Hotels"}
                </Button>
             </div>
          </div>
        </div>

        {error && (
          <Card className="text-left mt-4">
            <CardHeader>
              <CardTitle className="text-red-600">Request failed</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
          </Card>
        )}

        {hasNoResults && (
          <Card className="text-left mt-4">
            <CardHeader>
              <CardTitle>No results</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No hotels matched your current search. Try adding a city or specific priorities.
            </CardContent>
          </Card>
        )}

        {results && !hasNoResults && (
          <div className="text-left grid gap-6 mt-6 pb-10">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Preferences</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">City: {results.extracted_preferences.city ?? "Any"}</Badge>
                <Badge variant="outline">Area: {results.extracted_preferences.area ?? "Any"}</Badge>
                {results.extracted_preferences.priorities.map((priority) => (
                  <Badge key={priority}>{priority}</Badge>
                ))}
                {results.extracted_preferences.priorities.length === 0 && (
                  <span className="text-sm text-muted-foreground">No explicit priorities detected.</span>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranked Hotels</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {results.ranked_hotels.map((hotel) => (
                  <div key={hotel.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold font-heading">{hotel.name}</h3>
                      <Badge>{hotel.match_score}% match</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {hotel.area}, {hotel.city} | PKR {hotel.price_per_night.toLocaleString()} / night
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hotel.reason_codes.map((reason) => (
                        <Badge key={`${hotel.id}-${reason}`} variant="secondary">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparison Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Price (PKR)</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Cleanliness</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Wi-Fi</TableHead>
                      <TableHead>Parking</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Match</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.comparison_data.map((item) => (
                      <TableRow key={item.hotel_id}>
                        <TableCell>{item.hotel_name}</TableCell>
                        <TableCell>{item.price_per_night.toLocaleString()}</TableCell>
                        <TableCell>{item.rating}</TableCell>
                        <TableCell>{item.cleanliness_score}</TableCell>
                        <TableCell>{item.service_score}</TableCell>
                        <TableCell>{item.location_score}</TableCell>
                        <TableCell>{item.wifi_score}</TableCell>
                        <TableCell>{item.parking_score}</TableCell>
                        <TableCell>{item.value_score}</TableCell>
                        <TableCell>{item.match_score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Recommendation Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {results.recommendation_summary}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

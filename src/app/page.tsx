"use client";

import { useState } from "react";
import { hotels } from "@/lib/mockData";
import { Sparkles, Search, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function LandingSearchPage() {
  const [query, setQuery] = useState("");

  const filteredHotels = hotels.filter((hotel) => 
    hotel.name.toLowerCase().includes(query.toLowerCase()) ||
    hotel.location.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex-1 h-full bg-background flex flex-col items-center justify-center p-8 fade-in-up relative overflow-hidden">
      
      {/* Background Silhouette SVG */}
      <svg viewBox="0 0 1000 200" className="absolute bottom-0 left-0 w-full min-w-[800px] h-auto opacity-[0.03] text-foreground fill-current pointer-events-none z-0" preserveAspectRatio="none">
        <path d="M0,200 L0,150 L50,150 L50,80 L100,80 L100,180 L150,180 L150,100 L180,100 L180,50 L220,50 L220,160 L270,160 L270,120 L300,120 L300,180 L350,180 L350,90 L400,90 L400,40 L450,40 L450,170 L500,170 L500,110 L540,110 L540,60 L580,60 L580,140 L630,140 L630,70 L680,70 L680,160 L720,160 L720,100 L760,100 L760,40 L810,40 L810,130 L850,130 L850,80 L900,80 L900,150 L950,150 L950,90 L1000,90 L1000,200 Z" />
      </svg>

      <div className="max-w-2xl w-full text-center space-y-6 relative z-10 -mt-16">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
             <Sparkles className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-heading">
          StaySense AI
        </h1>
        <p className="text-lg text-muted-foreground font-serif max-w-xl mx-auto">
          Enter a property name to instantly uncover guest sentiment, critical operational issues, and AI recommendations.
        </p>

        <div className="pt-8 relative max-w-xl mx-auto">
          <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-primary rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative flex items-center">
                <Search className="absolute left-6 text-muted-foreground w-5 h-5 pointer-events-none" />
                <Input 
                  className="pl-14 pr-6 py-8 text-lg rounded-full bg-background border-border shadow-lg focus-visible:ring-primary placeholder:text-muted-foreground/70"
                  placeholder="Search by hotel name or location..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
             </div>
          </div>
        </div>

        {query.trim().length > 0 && (
          <div className="max-w-xl mx-auto mt-4 bg-card border border-border shadow-xl rounded-xl overflow-hidden text-left animate-in fade-in slide-in-from-top-2 absolute left-0 right-0">
            {filteredHotels.length > 0 ? (
              <ul className="divide-y divide-border">
                {filteredHotels.map((hotel) => (
                  <li key={hotel.id}>
                    <Link 
                      href={`/hotel/${hotel.id}/dashboard`}
                      className="flex items-center justify-between p-4 hover:bg-muted transition-colors group"
                    >
                      <div>
                        <h3 className="font-semibold font-heading group-hover:text-primary transition-colors">{hotel.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" /> {hotel.location}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No properties found matching "{query}".
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

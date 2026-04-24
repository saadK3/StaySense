export interface Hotel {
  id: string;
  name: string;
  location: string;
  rooms: number;
  overallRating: number;
  status: "Excellent" | "Good" | "Needs Attention";
  lastUpdated: string;
}

export const hotels: Hotel[] = [
  { id: "h1", name: "The Grand Horizon", location: "New York, NY", rooms: 450, overallRating: 4.8, status: "Excellent", lastUpdated: "2026-04-20" },
  { id: "h2", name: "Oceanview Retreat", location: "Miami, FL", rooms: 320, overallRating: 4.2, status: "Good", lastUpdated: "2026-04-22" },
  { id: "h3", name: "Mountain Pine Lodge", location: "Denver, CO", rooms: 150, overallRating: 3.5, status: "Needs Attention", lastUpdated: "2026-04-23" },
  { id: "h4", name: "City Center Inn", location: "Chicago, IL", rooms: 200, overallRating: 4.5, status: "Excellent", lastUpdated: "2026-04-24" },
  { id: "h5", name: "Lakeside Resort", location: "Tahoe, CA", rooms: 280, overallRating: 4.0, status: "Good", lastUpdated: "2026-04-19" },
];

export const getHotelData = (hotelId: string) => {
  const hotel = hotels.find(h => h.id === hotelId);

  // Return realistic mock data seeded based on the hotel characteristics
  let ratingTrends = [
    { month: "Jan", rating: 4.1, reviews: 120 },
    { month: "Feb", rating: 4.2, reviews: 140 },
    { month: "Mar", rating: 4.5, reviews: 180 },
    { month: "Apr", rating: 4.4, reviews: 160 },
    { month: "May", rating: 4.6, reviews: 210 },
    { month: "Jun", rating: 4.7, reviews: 250 },
  ];

  let sentimentScores = [
    { category: "Cleanliness", score: 85, fill: "var(--color-chart-1)" },
    { category: "Service", score: 92, fill: "var(--color-chart-2)" },
    { category: "Amenities", score: 78, fill: "var(--color-chart-3)" },
    { category: "Location", score: 95, fill: "var(--color-chart-4)" },
    { category: "Value", score: 88, fill: "var(--color-chart-5)" },
  ];

  let commonIssues = [
    { id: 1, issue: "HVAC Noise", count: 34, impactScore: -0.4, trend: "up", hotel: hotel?.name },
    { id: 2, issue: "Check-in Delay", count: 21, impactScore: -0.2, trend: "down", hotel: hotel?.name },
    { id: 3, issue: "Weak Wi-Fi", count: 45, impactScore: -0.5, trend: "stable", hotel: hotel?.name },
  ];

  let aiRecommendations = [
    { id: "r1", hotel: hotel?.name, title: "HVAC Maintenance Required", description: "34% of negative reviews mention loud AC units on the 3rd floor. We recommend scheduling maintenance or replacing units 301-320.", roiEstimate: "+0.3 Overall Rating", priority: "High" },
    { id: "r2", hotel: hotel?.name, title: "Upgrade Guest Wi-Fi", description: "Consistent complaints about Wi-Fi drops leading to poor business traveler scores. Moving to a mesh network could improve scores.", roiEstimate: "+0.4 Value Rating", priority: "Medium" }
  ];

  let chatHistory = [
    { role: "ai", content: `Hello! I am StaySense AI. I'm analyzing the guest sentiment and reviews for ${hotel?.name}. How can I help you?` },
    { role: "user", content: "What is our biggest problem right now?" }
  ];

  if (hotelId === "h3") {
    // Modify for Mountain Pine Lodge (Needs Attention)
    ratingTrends = ratingTrends.map(t => ({...t, rating: t.rating - 0.8}));
    sentimentScores = sentimentScores.map(t => ({...t, score: t.score - 15}));
    aiRecommendations.push({ id: "r3", hotel: hotel?.name, title: "Overhaul Cleaning Protocol", description: "Cleanliness scores plummeted during weekends. Staffing needs to be adjusted.", roiEstimate: "+0.8 Overall", priority: "High" });
  } else if (hotelId === "h1") {
     // Excellent
    ratingTrends = ratingTrends.map(t => ({...t, rating: Math.min(5, t.rating + 0.3)}));
    sentimentScores = sentimentScores.map(t => ({...t, score: Math.min(100, t.score + 5)}));
  }

  return {
    hotel,
    ratingTrends,
    sentimentScores,
    commonIssues,
    aiRecommendations,
    chatHistory,
    stats: {
      totalReviews: 1420,
      averageRating: hotel?.overallRating || 0,
      netSentiment: "+84%",
      criticalIssues: hotelId === "h3" ? 5 : 1
    }
  };
}

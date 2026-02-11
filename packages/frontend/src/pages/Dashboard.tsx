import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatsWidget from "@/components/StatsWidget";
import FoodCard from "@/components/FoodCard";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Heart,
  Coins,
  CheckCircle,
  Utensils,
  Trophy,
  TrendingUp,
} from "lucide-react";

const mockDonations = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    title: "Fresh Pasta & Bread",
    quantity: "50 servings",
    location: "Mumbai Central",
    expiresIn: "6 hours",
    status: "active" as const,
    freshnessScore: 92,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=300&fit=crop",
    title: "Mixed Fruit Platter",
    quantity: "30 kg",
    location: "Andheri West",
    expiresIn: "12 hours",
    status: "matched" as const,
    freshnessScore: 88,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
    title: "Vegetable Curry & Rice",
    quantity: "100 servings",
    location: "Bandra East",
    expiresIn: "3 hours",
    status: "verified" as const,
    freshnessScore: 95,
  },
];

const achievements = [
  { name: "First Donation", emoji: "🌱", earned: true },
  { name: "10 Meals Saved", emoji: "🍽️", earned: true },
  { name: "Community Hero", emoji: "🦸", earned: true },
  { name: "Chain Champion", emoji: "⛓️", earned: false },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Donor Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here&apos;s your impact overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-lg px-4 py-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">1,250 HBK</span>
            </div>
            <Button variant="hero" asChild>
              <Link to="/donate" className="gap-2">
                <Plus className="w-4 h-4" />
                New Donation
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsWidget icon={<Heart className="w-5 h-5" />} label="Total Donated" value={24} />
          <StatsWidget icon={<CheckCircle className="w-5 h-5" />} label="Verified" value={18} />
          <StatsWidget icon={<Utensils className="w-5 h-5" />} label="Meals Served" value={1200} />
          <StatsWidget icon={<TrendingUp className="w-5 h-5" />} label="Tokens Earned" value={1250} suffix=" HBK" />
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Achievements
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((badge) => (
              <div
                key={badge.name}
                className={`glass rounded-xl p-4 min-w-[140px] text-center hover-lift ${
                  !badge.earned ? "opacity-40" : ""
                }`}
              >
                <div className="text-3xl mb-2">{badge.emoji}</div>
                <div className="text-xs font-medium text-foreground">{badge.name}</div>
                {badge.earned && (
                  <Badge variant="outline" className="mt-2 text-[10px] bg-success/10 text-success border-success/30">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Donations</h2>
            <Link to="/donations" className="text-sm text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDonations.map((donation) => (
              <FoodCard key={donation.id} {...donation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

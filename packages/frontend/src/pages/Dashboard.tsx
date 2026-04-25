import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import StatsWidget from "@/components/StatsWidget";
import FoodCard from "@/components/FoodCard";
import { Skeleton as StatsSkeleton, CardSkeleton } from "@/components/Skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Heart,
  Coins,
  CheckCircle,
  Utensils,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAccount } from "wagmi";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  foodType: string;
  quantity: number;
  location: string;
  status: string;
  freshnessScore: number;
  ipfsHash: string;
  donor: {
    name?: string;
    walletAddress: string;
  };
  createdAt: string;
}

interface UserStats {
  totalDonations: number;
  verifiedDonations: number;
  mealsServed: number;
  tokensEarned: number;
}

const achievements = [
  { name: "First Donation", emoji: "🌱", threshold: 1 },
  { name: "10 Meals Saved", emoji: "🍽️", threshold: 10 },
  { name: "Community Hero", emoji: "🦸", threshold: 25 },
  { name: "Chain Champion", emoji: "⛓️", threshold: 50 },
];

const Dashboard = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalDonations: 0,
    verifiedDonations: 0,
    mealsServed: 0,
    tokensEarned: 0,
  });
  const [tokenBalance, setTokenBalance] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const [donationsRes, statsRes] = await Promise.all([
          api.get(`/api/donations?donorAddress=${address}&limit=6`),
          api.get(`/api/users/${address}/stats`),
        ]);

        setDonations(donationsRes.data.donations || []);
        setStats(statsRes.data || stats);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatsSkeleton key={i} />
            ))}
          </div>
          <div className="mb-8">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-36 rounded-xl" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
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
              <span className="font-semibold text-foreground">
                {parseFloat(tokenBalance).toLocaleString()} HBK
              </span>
            </div>
            <Button variant="hero" asChild>
              <Link to="/donate" className="gap-2">
                <Plus className="w-4 h-4" />
                New Donation
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsWidget icon={<Heart className="w-5 h-5" />} label="Total Donated" value={stats.totalDonations} />
          <StatsWidget icon={<CheckCircle className="w-5 h-5" />} label="Verified" value={stats.verifiedDonations} />
          <StatsWidget icon={<Utensils className="w-5 h-5" />} label="Meals Served" value={stats.mealsServed} />
          <StatsWidget icon={<TrendingUp className="w-5 h-5" />} label="Tokens Earned" value={Math.floor(parseFloat(tokenBalance))} suffix=" HBK" />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Achievements
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {achievements.map((badge) => {
              const earned = stats.totalDonations >= badge.threshold;
              return (
                <div
                  key={badge.name}
                  className={`glass rounded-xl p-4 min-w-[140px] text-center hover-lift ${
                    !earned ? "opacity-40" : ""
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.emoji}</div>
                  <div className="text-xs font-medium text-foreground">{badge.name}</div>
                  {earned && (
                    <Badge variant="outline" className="mt-2 text-[10px] bg-success/10 text-success border-success/30">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Donations</h2>
            <Link to="/donations" className="text-sm text-primary hover:underline">
              View All →
            </Link>
          </div>
          {donations.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No donations yet</h3>
              <p className="text-muted-foreground mb-6">
                Start making an impact by creating your first donation
              </p>
              <Button variant="hero" asChild>
                <Link to="/donate" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Donation
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {donations.map((donation) => (
                <FoodCard
                  key={donation.id}
                  id={donation.id}
                  image={`https://source.unsplash.com/400x300/?food,${donation.foodType}`}
                  title={donation.foodType}
                  quantity={`${donation.quantity} servings`}
                  location={donation.location}
                  expiresIn="24 hours"
                  status={donation.status.toLowerCase() as any}
                  freshnessScore={donation.freshnessScore}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

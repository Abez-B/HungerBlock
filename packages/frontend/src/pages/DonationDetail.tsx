import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Clock,
  Utensils,
  User,
  CheckCircle,
  Coins,
} from "lucide-react";

const mockDonation = {
  id: "1",
  image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop",
  title: "Fresh Pasta & Bread",
  foodType: "Italian Cuisine",
  quantity: "50 servings",
  location: "Mumbai Central, Maharashtra",
  expiresIn: "6 hours",
  status: "matched",
  freshnessScore: 92,
  donor: "0x1a2b3c...4d5e6f",
  createdAt: "2026-02-10 14:30",
  matchedNgo: "Feed The Hungry Foundation",
  ngoAddress: "0x7a8b9c...0d1e2f",
  matchedAt: "2026-02-10 15:45",
  verifier: null,
  rewardsEarned: 50,
  ipfsHash: "QmX7h...abc123",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  matched: "bg-primary/10 text-primary border-primary/30",
  verified: "bg-accent text-accent-foreground border-accent-foreground/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const timeline = [
  { label: "Donation Created", time: "Feb 10, 14:30", done: true },
  { label: "Matched with NGO", time: "Feb 10, 15:45", done: true },
  { label: "Delivery Verified", time: "Pending", done: false },
];

const DonationDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/donations" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Donations
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl overflow-hidden">
              <div className="relative">
                <img src={mockDonation.image} alt={mockDonation.title} className="w-full h-72 object-cover" />
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={`${statusColors[mockDonation.status]} capitalize text-sm`}>
                    {mockDonation.status}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-foreground">
                  🌿 {mockDonation.freshnessScore}% Fresh
                </div>
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-foreground mb-4">{mockDonation.title}</h1>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Utensils className="w-4 h-4" />
                    <span>{mockDonation.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{mockDonation.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Expires in {mockDonation.expiresIn}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="font-mono text-xs">{mockDonation.donor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Details */}
            {mockDonation.matchedNgo && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Match Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NGO</span>
                    <span className="text-foreground font-medium">{mockDonation.matchedNgo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NGO Address</span>
                    <span className="font-mono text-xs text-foreground">{mockDonation.ngoAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matched At</span>
                    <span className="text-foreground">{mockDonation.matchedAt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? "gradient-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"
                        }`}>
                        {item.done ? <CheckCircle className="w-3 h-3" /> : <span className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${item.done ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-3">Rewards</h3>
              <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-4">
                <Coins className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{mockDonation.rewardsEarned} HBK</div>
                  <div className="text-xs text-muted-foreground">Pending verification</div>
                </div>
              </div>
            </div>

            {/* IPFS Link */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-3">On-Chain Data</h3>
              <Button variant="outline" className="w-full gap-2 text-sm" asChild>
                <a href="#" target="_blank">
                  <ExternalLink className="w-4 h-4" />
                  View on Etherscan
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationDetail;

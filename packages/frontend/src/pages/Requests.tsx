import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, AlertTriangle, Plus } from "lucide-react";

const mockRequests = [
  {
    id: "r1",
    ngo: "Feed The Hungry Foundation",
    foodType: "Rice & Dal",
    quantity: "200 servings",
    urgency: 5,
    location: "Dharavi, Mumbai",
    status: "open" as const,
    createdAt: "2 hours ago",
  },
  {
    id: "r2",
    ngo: "Hope Shelter",
    foodType: "Bread & Vegetables",
    quantity: "100 servings",
    urgency: 3,
    location: "Andheri East",
    status: "matched" as const,
    createdAt: "5 hours ago",
  },
  {
    id: "r3",
    ngo: "Children First NGO",
    foodType: "Fruits & Milk",
    quantity: "50 servings",
    urgency: 4,
    location: "Bandra West",
    status: "open" as const,
    createdAt: "1 hour ago",
  },
  {
    id: "r4",
    ngo: "Elder Care Trust",
    foodType: "Soft Foods & Soup",
    quantity: "80 servings",
    urgency: 2,
    location: "Colaba",
    status: "fulfilled" as const,
    createdAt: "1 day ago",
  },
];

const urgencyLabel = (u: number) => {
  if (u >= 5) return { text: "Critical", className: "bg-destructive/10 text-destructive" };
  if (u >= 4) return { text: "High", className: "bg-primary/10 text-primary" };
  if (u >= 3) return { text: "Medium", className: "bg-accent text-accent-foreground" };
  return { text: "Low", className: "bg-muted/30 text-muted-foreground" };
};

const statusStyle: Record<string, string> = {
  open: "bg-success/10 text-success",
  matched: "bg-primary/10 text-primary",
  fulfilled: "bg-accent text-accent-foreground",
};

const Requests = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockRequests.filter(
    (r) =>
      r.ngo.toLowerCase().includes(search.toLowerCase()) ||
      r.foodType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Food Requests</h1>
            <p className="text-muted-foreground">NGO requests for surplus food.</p>
          </div>
          <Button variant="hero" className="gap-2" onClick={() => navigate('/create-request')}>
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by NGO or food type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((req) => {
            const urg = urgencyLabel(req.urgency);
            return (
              <div key={req.id} className="glass rounded-xl p-5 hover-lift">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{req.ngo}</h3>
                      <Badge variant="outline" className={`${statusStyle[req.status]} capitalize text-xs`}>
                        {req.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{req.foodType} · {req.quantity}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {req.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {req.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${urg.className} text-xs gap-1`}>
                      <AlertTriangle className="w-3 h-3" />
                      {urg.text}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/requests/${req.id}`)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Requests;

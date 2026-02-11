import { useState } from "react";
import FoodCard from "@/components/FoodCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

const allDonations = [
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
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    title: "Pizza & Garlic Bread",
    quantity: "25 boxes",
    location: "Juhu Beach",
    expiresIn: "4 hours",
    status: "active" as const,
    freshnessScore: 90,
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    title: "Fresh Salad Bowls",
    quantity: "40 bowls",
    location: "Colaba",
    expiresIn: "8 hours",
    status: "active" as const,
    freshnessScore: 96,
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop",
    title: "Sandwiches & Wraps",
    quantity: "60 pieces",
    location: "Powai",
    expiresIn: "5 hours",
    status: "cancelled" as const,
    freshnessScore: 70,
  },
];

const statusFilters = ["All", "Active", "Matched", "Verified", "Cancelled"];

const Donations = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allDonations.filter((d) => {
    const matchesStatus = activeFilter === "All" || d.status === activeFilter.toLowerCase();
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Donations</h1>
          <p className="text-muted-foreground">Find and track food donations near you.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by food type or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((donation) => (
              <FoodCard key={donation.id} {...donation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <SlidersHorizontal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No donations found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;

import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Utensils } from "lucide-react";

export interface FoodCardProps {
  id: string;
  image: string;
  title: string;
  quantity: string;
  location: string;
  expiresIn: string;
  status: "active" | "matched" | "verified" | "cancelled";
  freshnessScore?: number;
}

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  matched: "bg-primary/10 text-primary border-primary/30",
  verified: "bg-accent text-accent-foreground border-accent-foreground/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const FoodCard = ({
  id,
  image,
  title,
  quantity,
  location,
  expiresIn,
  status,
  freshnessScore,
}: FoodCardProps) => {
  return (
    <Link to={`/donations/${id}`} className="block group">
      <div className="glass rounded-xl overflow-hidden hover-lift">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className={`${statusColors[status]} capitalize`}>
              {status}
            </Badge>
          </div>
          {freshnessScore !== undefined && (
            <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-foreground">
              🌿 {freshnessScore}% Fresh
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5" />
              <span>{quantity}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Expires {expiresIn}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FoodCard;

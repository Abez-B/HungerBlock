import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, AlertTriangle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Mock data - replace with API call
    const request = {
        id: id,
        ngo: "Feed The Hungry Foundation",
        foodType: "Rice & Dal",
        quantity: "200 servings",
        urgency: 5,
        location: "Dharavi, Mumbai",
        status: "open",
        createdAt: "2 hours ago",
        notes: "Urgent need for evening meal distribution. We serve 200+ people daily.",
    };

    const urgencyLabel = (u: number) => {
        if (u >= 5) return { text: "Critical", className: "bg-destructive/10 text-destructive" };
        if (u >= 4) return { text: "High", className: "bg-primary/10 text-primary" };
        if (u >= 3) return { text: "Medium", className: "bg-accent text-accent-foreground" };
        return { text: "Low", className: "bg-muted/30 text-muted-foreground" };
    };

    const handleMatchDonation = () => {
        // TODO: Implement matching logic with API call
        toast({
            title: "Matching in Progress",
            description: "Searching for available donations that match this request...",
        });
        // Navigate to donations page to select a match
        setTimeout(() => {
            navigate("/donations");
        }, 1500);
    };

    const handleContactNGO = () => {
        // TODO: Implement contact functionality
        toast({
            title: "Contact Information",
            description: `Contact ${request.ngo} at their registered email or phone number.`,
        });
    };

    const urg = urgencyLabel(request.urgency);

    return (
        <div className="min-h-screen pt-20 pb-10">
            <div className="container mx-auto px-4 max-w-3xl">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => navigate("/requests")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Requests
                </Button>

                <div className="glass rounded-xl p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                {request.foodType}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>{request.ngo}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className={`${urg.className} gap-1`}>
                                <AlertTriangle className="w-3 h-3" />
                                {urg.text}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {request.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass rounded-lg p-4">
                            <div className="text-sm text-muted-foreground mb-1">Quantity Needed</div>
                            <div className="text-lg font-semibold">{request.quantity}</div>
                        </div>
                        <div className="glass rounded-lg p-4">
                            <div className="text-sm text-muted-foreground mb-1">Location</div>
                            <div className="text-lg font-semibold flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {request.location}
                            </div>
                        </div>
                    </div>

                    <div className="glass rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-2">Additional Details</div>
                        <p className="text-foreground">{request.notes}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Posted {request.createdAt}</span>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="hero" className="flex-1" onClick={handleMatchDonation}>
                            Match with Donation
                        </Button>
                        <Button variant="outline" onClick={handleContactNGO}>
                            Contact NGO
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;

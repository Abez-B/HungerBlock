import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";

const CreateRequest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ngoName: "",
        foodType: "",
        quantity: "",
        urgency: "3",
        location: "",
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add API call to create request
        console.log("Creating request:", formData);
        navigate("/requests");
    };

    return (
        <div className="min-h-screen pt-20 pb-10">
            <div className="container mx-auto px-4 max-w-2xl">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => navigate("/requests")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Requests
                </Button>

                <div className="glass rounded-xl p-6">
                    <h1 className="text-2xl font-bold text-foreground mb-6">
                        Create Food Request
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="ngoName">NGO Name</Label>
                            <Input
                                id="ngoName"
                                value={formData.ngoName}
                                onChange={(e) =>
                                    setFormData({ ...formData, ngoName: e.target.value })
                                }
                                placeholder="Your organization name"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="foodType">Food Type Needed</Label>
                            <Input
                                id="foodType"
                                value={formData.foodType}
                                onChange={(e) =>
                                    setFormData({ ...formData, foodType: e.target.value })
                                }
                                placeholder="e.g., Rice & Dal, Vegetables, Bread"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, quantity: e.target.value })
                                }
                                placeholder="e.g., 100 servings, 50 kg"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="urgency">Urgency Level (1-5)</Label>
                            <Input
                                id="urgency"
                                type="number"
                                min="1"
                                max="5"
                                value={formData.urgency}
                                onChange={(e) =>
                                    setFormData({ ...formData, urgency: e.target.value })
                                }
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                1 = Low, 5 = Critical
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) =>
                                    setFormData({ ...formData, location: e.target.value })
                                }
                                placeholder="Area, City"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="notes">Additional Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Any specific requirements or details..."
                                rows={4}
                            />
                        </div>

                        <Button type="submit" variant="hero" className="w-full gap-2">
                            <Send className="w-4 h-4" />
                            Submit Request
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRequest;

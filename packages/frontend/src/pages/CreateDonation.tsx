import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const steps = ["Upload Photo", "Food Details", "Review & Submit"];

const CreateDonation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    foodType: "",
    quantity: "",
    unit: "servings",
    expiryDate: "",
    location: "",
    notes: "",
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // TODO: Upload image to IPFS first
      // const ipfsHash = await uploadToIPFS(image);

      // Create donation via API (simplified endpoint for testing)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/donations/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodType: formData.foodType,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          expiryDate: formData.expiryDate,
          location: formData.location,
          notes: formData.notes,
          imageUrl: image, // Temporary - should be IPFS hash
          status: 'active',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create donation');
      }

      const result = await response.json();

      toast({
        title: "Donation Created!",
        description: "Your donation has been submitted successfully.",
      });

      // Navigate to donations page to see the new donation
      setTimeout(() => {
        navigate("/donations");
      }, 1000);

    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: "Error",
        description: "Failed to create donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Donation</h1>
        <p className="text-muted-foreground mb-8">Share surplus food with those who need it most.</p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= currentStep
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground"
                  }`}
              >
                {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step}
              </span>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {currentStep === 0 && (
          <div className="animate-fade-up">
            <div className="glass rounded-xl p-8">
              {!image ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 cursor-pointer hover:border-primary/50 transition-colors">
                  <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                  <span className="text-foreground font-medium mb-1">Upload food photo</span>
                  <span className="text-sm text-muted-foreground">Drag & drop or click to browse</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="space-y-4">
                  <img src={image} alt="Food" className="w-full h-64 object-cover rounded-xl" />
                  <Button variant="outline" onClick={() => setImage(null)} className="w-full">
                    Re-upload Photo
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                variant="hero"
                onClick={() => setCurrentStep(1)}
                disabled={!image}
                className="gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 1 && (
          <div className="animate-fade-up">
            <div className="glass rounded-xl p-8 space-y-5">
              <div>
                <Label htmlFor="foodType">Food Type</Label>
                <Input
                  id="foodType"
                  value={formData.foodType}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  placeholder="e.g. Rice, Pasta, Vegetables"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="servings">Servings</option>
                    <option value="kg">Kilograms</option>
                    <option value="boxes">Boxes</option>
                    <option value="plates">Plates</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Pickup Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. 123 Main St, Mumbai"
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions or details..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(0)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                variant="hero"
                onClick={() => setCurrentStep(2)}
                disabled={!formData.foodType || !formData.quantity || !formData.expiryDate || !formData.location}
                className="gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 2 && (
          <div className="animate-fade-up">
            <div className="glass rounded-xl p-8 space-y-6">
              <h2 className="text-xl font-bold text-foreground">Review Your Donation</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <img src={image!} alt="Food" className="w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Food Type</div>
                      <div className="font-medium">{formData.foodType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="font-medium">{formData.quantity} {formData.unit}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Expiry Date</div>
                    <div className="font-medium">{formData.expiryDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{formData.location}</div>
                  </div>
                </div>

                {formData.notes && (
                  <div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="font-medium">{formData.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit Donation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateDonation;

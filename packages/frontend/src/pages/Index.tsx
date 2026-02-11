import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatsWidget from "@/components/StatsWidget";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import {
  Link2,
  Bot,
  Coins,
  Trophy,
  Upload,
  Search,
  CheckCircle,
  Heart,
  Users,
  Utensils,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: <Link2 className="w-6 h-6" />,
    title: "Blockchain Transparency",
    description: "Every donation is recorded on Ethereum blockchain for full traceability and trust.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "AI Food Verification",
    description: "Our AI analyzes food quality and freshness to ensure safe redistribution.",
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: "Earn Reward Tokens",
    description: "Donors earn HBK tokens for every verified donation, redeemable for perks.",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "Achievement NFTs",
    description: "Collect unique NFT badges as you hit milestones and make an impact.",
  },
];

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "Upload Surplus Food",
    description: "Donors upload photos and details of surplus food from restaurants or hotels.",
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: "AI Verifies & Matches",
    description: "Our AI checks food quality and matches donations with nearby NGOs in need.",
  },
  {
    icon: <CheckCircle className="w-8 h-8" />,
    title: "Deliver & Earn Rewards",
    description: "Verified deliveries earn reward tokens and achievement badges on-chain.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Food blockchain network"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/70 dark:bg-background/80" />
        </div>

        <div className="relative container mx-auto px-4 pt-24 pb-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-up">
              <Coins className="w-4 h-4" />
              Powered by Ethereum Blockchain
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              End Food Waste,{" "}
              <span className="text-primary">Fight Hunger</span>{" "}
              with Blockchain
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Connect surplus food from restaurants and hotels with NGOs who need it most.
              Every donation is transparent, verified, and rewarded.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/donate" className="gap-2">
                  <Heart className="w-5 h-5" />
                  Donate Food
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/requests" className="gap-2">
                  Request Food
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why <span className="text-primary">HungerBlock</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Combining blockchain transparency with AI intelligence for a hunger-free world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-6 hover-lift animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It <span className="text-primary">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to make an impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground mx-auto mb-5 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-primary text-primary text-sm font-bold flex items-center justify-center mx-auto" style={{ left: "calc(50% + 20px)" }}>
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Impact</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StatsWidget icon={<Heart className="w-6 h-6" />} label="Total Donations" value={12450} />
            <StatsWidget icon={<Utensils className="w-6 h-6" />} label="Meals Served" value={48200} />
            <StatsWidget icon={<Users className="w-6 h-6" />} label="Active NGOs" value={340} />
            <StatsWidget icon={<Coins className="w-6 h-6" />} label="Tokens Distributed" value={89500} prefix="" suffix=" HBK" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-10 md:p-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Make a <span className="text-primary">Difference</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join thousands of donors and NGOs fighting hunger together on the blockchain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/donate">Start Donating</Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

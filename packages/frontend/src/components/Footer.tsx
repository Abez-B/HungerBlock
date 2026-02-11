import { UtensilsCrossed, Github, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Hunger<span className="text-primary">Block</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Fighting hunger with blockchain transparency. Every meal counts, every donation is tracked.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/donations" className="hover:text-primary transition-colors">Browse Donations</Link>
              <Link to="/requests" className="hover:text-primary transition-colors">Browse Requests</Link>
              <Link to="/donate" className="hover:text-primary transition-colors">Donate Food</Link>
              <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Community</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                <Twitter className="w-4 h-4" /> Twitter
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2026 HungerBlock. Built on Sepolia. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

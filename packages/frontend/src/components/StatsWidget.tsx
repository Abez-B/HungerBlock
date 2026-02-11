import { useEffect, useState } from "react";

interface StatsWidgetProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

const StatsWidget = ({ icon, label, value, suffix = "", prefix = "" }: StatsWidgetProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass rounded-xl p-6 hover-lift text-center">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
        {icon}
      </div>
      <div className="text-3xl font-bold text-foreground animate-count-up">
        {prefix}{displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

export default StatsWidget;

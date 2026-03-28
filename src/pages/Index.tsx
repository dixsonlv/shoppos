import React from "react";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, Settings } from "lucide-react";
import uniwebLogo from "@/assets/uniweb-logo.jpg";

const Index: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
    <img src={uniwebLogo} alt="Uniweb" className="w-20 h-20 rounded-2xl mb-6 shadow-lg" />
    <h1 className="text-2xl font-bold text-foreground mb-2">Uniweb Smart POS</h1>
    <p className="text-muted-foreground mb-8">Select a surface to explore</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full">
      {[
        { to: "/tablet", icon: Monitor, title: "Tablet POS", desc: "Cashier workstation" },
        { to: "/mobile", icon: Smartphone, title: "Mobile POS", desc: "Handheld ordering" },
        { to: "/admin", icon: Settings, title: "Admin", desc: "Merchant portal" },
      ].map(s => (
        <Link key={s.to} to={s.to}
          className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border-1.5 border-border hover:border-primary/40 hover:shadow-md transition-all active:scale-95">
          <s.icon className="w-8 h-8 text-primary" />
          <h2 className="text-sm font-bold text-foreground">{s.title}</h2>
          <p className="text-xs text-muted-foreground">{s.desc}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default Index;

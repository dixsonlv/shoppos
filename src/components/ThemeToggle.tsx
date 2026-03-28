import React from "react";
import { Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage, type Lang } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[44px] min-w-[44px] justify-center"
        title={theme === "dark" ? t("light") : t("dark")}
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button
        onClick={() => setLang(lang === "en" ? "zh" : "en")}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[44px] min-w-[44px] justify-center"
      >
        {lang === "en" ? "中" : "EN"}
      </button>
    </div>
  );
};

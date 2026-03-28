import React, { useState } from "react";
import { Search, Star, Plus, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuItems, categories, modifierGroups, type Table, type Order, type MenuItem } from "@/data/mock-data";
import { ModifierDialog } from "@/components/tablet/ModifierDialog";
import { useLanguage } from "@/hooks/useLanguage";

interface MenuComposerProps {
  onAddItem: (menuItemId: string, modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => void;
  selectedTable?: Table;
  currentOrder: Order | null;
}

export const MenuComposer: React.FC<MenuComposerProps> = ({ onAddItem, selectedTable, currentOrder }) => {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [modifierItem, setModifierItem] = useState<MenuItem | null>(null);

  const filteredItems = menuItems.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.nameZh?.includes(q);
    }
    if (activeCategory === "All") return true;
    if (activeCategory === "Popular") return item.popular;
    return item.category === activeCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    if (!item.available) return;
    if ((item.modifierGroups && item.modifierGroups.length > 0) || item.isCombo) {
      setModifierItem(item);
    } else {
      onAddItem(item.id, []);
    }
  };

  const handleModifierConfirm = (modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => {
    if (modifierItem) {
      onAddItem(modifierItem.id, modifiers, notes, comboItems);
      setModifierItem(null);
    }
  };

  const getItemName = (item: MenuItem) => lang === "zh" && item.nameZh ? item.nameZh : item.name;

  const getComboDisplay = (item: MenuItem) => {
    if (!item.isCombo) return null;
    if (item.comboIncludes && item.comboIncludes.length > 0) {
      return item.comboIncludes.join(" · ");
    }
    if (item.comboGroups) {
      return item.comboGroups.map(g => lang === "zh" && g.nameZh ? g.nameZh : g.name).join(" + ");
    }
    return null;
  };

  const categoryLabel = (cat: string) => {
    const key = cat.toLowerCase().replace(/ /g, "_");
    const translated = t(key);
    return translated !== key ? translated : cat;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        {selectedTable ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-foreground">{t("tables")} {selectedTable.number}</span>
              <span className="ml-2 text-[11px] text-muted-foreground">{currentOrder?.serviceMode || "dine-in"}</span>
            </div>
            {selectedTable.guestCount && (
              <span className="text-[11px] text-muted-foreground">{selectedTable.guestCount} {t("guests")}</span>
            )}
          </div>
        ) : currentOrder ? (
          <div>
            <span className="text-sm font-bold text-foreground">{currentOrder.serviceMode}</span>
            <span className="ml-2 text-[11px] text-muted-foreground mono">#{currentOrder.id.slice(-4)}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Select a table or create an order</span>
        )}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            placeholder={t("search_menu")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-[9px] bg-background border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Category Rail */}
      <div className="flex gap-1.5 px-4 py-2 border-b border-border overflow-x-auto pos-scrollbar">
        {categories.map(cat => (
          <button key={cat}
            onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors min-h-[36px]",
              activeCategory === cat && !searchQuery
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Menu Grid - FIXED: images cover card top */}
      <div className="flex-1 overflow-y-auto pos-scrollbar p-3 grid grid-cols-3 gap-3 auto-rows-min">
        {filteredItems.map(item => {
          const comboDisplay = getComboDisplay(item);
          return (
            <button key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={!item.available || !currentOrder}
              className={cn(
                "relative rounded-lg border-1.5 text-left transition-all group overflow-hidden",
                item.available && currentOrder
                  ? "bg-card border-border hover:border-primary/40 hover:shadow-sm cursor-pointer active:scale-[0.97]"
                  : "bg-accent border-border/50 opacity-60 cursor-not-allowed"
              )}
            >
              {/* Image - FIXED: object-fit cover, fixed height, overflow hidden */}
              <div className="relative w-full h-[100px] overflow-hidden rounded-t-lg">
                {item.image ? (
                  <img src={item.image} alt={item.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center">
                    <span className="text-2xl">🍽</span>
                  </div>
                )}
                {item.popular && (
                  <Star className="absolute top-1.5 right-1.5 w-4 h-4 text-amber-500 fill-amber-400" />
                )}
                {item.isCombo && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {item.isFlexCombo ? <Zap className="w-2.5 h-2.5" /> : <Package className="w-2.5 h-2.5" />}
                    {item.isFlexCombo ? (lang === "zh" ? "自选" : "FLEX") : (lang === "zh" ? "套餐" : "COMBO")}
                  </span>
                )}
              </div>

              <div className="p-2">
                <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-1">
                  {getItemName(item)}
                </p>
                {lang === "zh" && item.nameZh && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{item.name}</p>
                )}
                {lang === "en" && item.nameZh && (
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{item.nameZh}</p>
                )}
                {comboDisplay && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {t("includes")}: {comboDisplay}
                  </p>
                )}
                <p className="text-[13px] font-bold text-foreground mt-1 font-mono">
                  ${item.price.toFixed(2)}
                </p>
                {!item.available && (
                  <span className="text-[10px] text-destructive font-medium">{t("unavailable")}</span>
                )}
              </div>

              {item.available && currentOrder && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Plus className="w-8 h-8 text-primary drop-shadow-lg" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {modifierItem && (
        <ModifierDialog
          item={modifierItem}
          groups={modifierGroups.filter(g => modifierItem.modifierGroups?.includes(g.id))}
          onConfirm={handleModifierConfirm}
          onCancel={() => setModifierItem(null)}
        />
      )}
    </div>
  );
};

import React, { useState } from "react";
import { Plus, Pencil, Search, Package, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menuItems, categories } from "@/data/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const AdminMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("items");
  const [search, setSearch] = useState("");

  const allItems = menuItems.filter(i => !i.isCombo);
  const combos = menuItems.filter(i => i.isCombo);
  const displayCategories = categories.filter(c => c !== "All" && c !== "Combos");

  const filteredItems = search
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const filteredCombos = search
    ? combos.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : combos;

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Menu Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{allItems.length} items · {combos.length} combos · {displayCategories.length} categories</p>
        </div>
        <Button className="rounded-lg"><Plus className="h-4 w-4 mr-1.5" />Add Item</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center gap-4 mb-5">
          <TabsList className="bg-accent rounded-lg">
            <TabsTrigger value="items" className="text-[13px] rounded-md">All Items</TabsTrigger>
            <TabsTrigger value="combos" className="text-[13px] rounded-md">
              <Package className="h-3.5 w-3.5 mr-1.5" />Combos
            </TabsTrigger>
          </TabsList>
          <div className="relative w-64 ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[9px] bg-card border-1.5 border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Items tab */}
        <TabsContent value="items">
          {displayCategories.map(cat => {
            const items = filteredItems.filter(m => m.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-6">
                <div className="section-label mb-3 pb-2 border-b border-border">{cat}</div>
                <div className="uniweb-card divide-y divide-border">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-accent transition-colors cursor-pointer">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent shrink-0 border border-border">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[13px] font-medium text-foreground">{item.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.modifierGroups?.length || 0} modifier groups</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] font-semibold text-foreground font-mono">${item.price.toFixed(2)}</span>
                        <span className={`status-badge ${item.available ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"}`}>
                          <span className={`status-dot ${item.available ? "bg-status-green" : "bg-status-red"}`} />
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                        <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Combos tab */}
        <TabsContent value="combos">
          <div className="space-y-4">
            {filteredCombos.map(combo => (
              <div key={combo.id} className="uniweb-card overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Combo thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent shrink-0 border border-border">
                    {combo.image ? (
                      <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-foreground">{combo.name}</h3>
                      <span className="text-[10px] font-bold text-primary bg-status-blue-light px-2 py-0.5 rounded-md">COMBO</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {combo.comboGroups?.length || 0} selection groups
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-bold text-primary font-mono">${combo.price.toFixed(2)}</span>
                    <span className={`status-badge ${combo.available ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red"}`}>
                      <span className={`status-dot ${combo.available ? "bg-status-green" : "bg-status-red"}`} />
                      {combo.available ? "Active" : "Inactive"}
                    </span>
                    <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Combo groups */}
                {combo.comboGroups && (
                  <div className="border-t border-border px-5 py-3 bg-accent/30">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {combo.comboGroups.map(group => {
                        const groupItems = menuItems.filter(m => group.allowedItems.includes(m.id));
                        return (
                          <div key={group.id} className="bg-card rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">{group.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {group.required ? "Required" : "Optional"} · max {group.maxSelect}
                              </span>
                            </div>
                            <div className="space-y-1">
                              {groupItems.map(gi => (
                                <div key={gi.id} className="flex items-center gap-2 text-[12px]">
                                  {gi.image ? (
                                    <img src={gi.image} alt={gi.name} className="w-5 h-5 rounded object-cover" />
                                  ) : (
                                    <div className="w-5 h-5 rounded bg-accent" />
                                  )}
                                  <span className="text-foreground truncate">{gi.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMenu;

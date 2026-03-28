import React, { useState } from "react";
import { Plus, Pencil, Search, Package, Image as ImageIcon, X, Check, Trash2, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { menuItems as initialMenuItems, categories, type MenuItem } from "@/data/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Shared state for menu items (in production this would be a context/store)
let sharedMenuItems = [...initialMenuItems];
export const getMenuItems = () => sharedMenuItems;

interface EditingItem {
  id: string;
  name: string;
  nameZh: string;
  price: number;
  category: string;
  available: boolean;
}

const AdminMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState("items");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MenuItem[]>([...initialMenuItems]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditingItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<EditingItem>({ id: "", name: "", nameZh: "", price: 0, category: "Mains", available: true });

  const allItems = items.filter(i => !i.isCombo);
  const combos = items.filter(i => i.isCombo);
  const displayCategories = categories.filter(c => c !== "All" && c !== "Combos");

  const filteredItems = search
    ? allItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.nameZh?.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const filteredCombos = search
    ? combos.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))
    : combos;

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ id: item.id, name: item.name, nameZh: item.nameZh || "", price: item.price, category: item.category, available: item.available });
  };

  const saveEdit = () => {
    if (!editForm) return;
    setItems(prev => prev.map(i => i.id === editForm.id ? { ...i, name: editForm.name, nameZh: editForm.nameZh, price: editForm.price, category: editForm.category, available: editForm.available } : i));
    sharedMenuItems = sharedMenuItems.map(i => i.id === editForm.id ? { ...i, name: editForm.name, nameZh: editForm.nameZh, price: editForm.price, category: editForm.category, available: editForm.available } : i);
    setEditingId(null);
    setEditForm(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditForm(null); };

  const toggleAvailability = (itemId: string) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, available: !i.available } : i));
    sharedMenuItems = sharedMenuItems.map(i => i.id === itemId ? { ...i, available: !i.available } : i);
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
    sharedMenuItems = sharedMenuItems.filter(i => i.id !== itemId);
  };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const created: MenuItem = {
      id: `m-new-${Date.now()}`,
      name: newItem.name,
      nameZh: newItem.nameZh || undefined,
      price: newItem.price,
      category: newItem.category,
      available: newItem.available,
    };
    setItems(prev => [...prev, created]);
    sharedMenuItems.push(created);
    setShowAddForm(false);
    setNewItem({ id: "", name: "", nameZh: "", price: 0, category: "Mains", available: true });
  };

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Menu Management</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{allItems.length} items · {combos.length} combos · {displayCategories.length} categories</p>
        </div>
        <Button className="rounded-lg gap-1.5 text-[13px]" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4" />Add Item
        </Button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-foreground">New Menu Item</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1.5 rounded-md hover:bg-accent"><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Name (EN)</label>
              <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-[13px] text-foreground focus:outline-none focus:border-primary transition-all" placeholder="Chicken Rice" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Name (ZH)</label>
              <input value={newItem.nameZh} onChange={e => setNewItem(p => ({ ...p, nameZh: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-[13px] text-foreground focus:outline-none focus:border-primary transition-all" placeholder="海南鸡饭" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Price ($)</label>
              <input type="number" step="0.50" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-[13px] text-foreground font-mono focus:outline-none focus:border-primary transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Category</label>
              <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-[13px] text-foreground focus:outline-none focus:border-primary transition-all">
                {displayCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button size="sm" onClick={addItem} disabled={!newItem.name.trim()} className="gap-1.5"><Save className="h-3.5 w-3.5" />Save Item</Button>
          </div>
        </div>
      )}

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
            const catItems = filteredItems.filter(m => m.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="mb-6">
                <div className="section-label mb-3 pb-2 border-b border-border">{cat}</div>
                <div className="uniweb-card divide-y divide-border">
                  {catItems.map(item => {
                    const isEditing = editingId === item.id;
                    if (isEditing && editForm) {
                      return (
                        <div key={item.id} className="flex items-center gap-4 px-5 py-3 bg-primary/3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent shrink-0 border border-border">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                            )}
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                            <input value={editForm.name} onChange={e => setEditForm(p => p ? { ...p, name: e.target.value } : p)}
                              className="h-8 px-2 rounded-md bg-background border border-border text-[12px] text-foreground focus:outline-none focus:border-primary" placeholder="Name" />
                            <input value={editForm.nameZh} onChange={e => setEditForm(p => p ? { ...p, nameZh: e.target.value } : p)}
                              className="h-8 px-2 rounded-md bg-background border border-border text-[12px] text-foreground focus:outline-none focus:border-primary" placeholder="中文名" />
                            <input type="number" step="0.50" value={editForm.price} onChange={e => setEditForm(p => p ? { ...p, price: parseFloat(e.target.value) || 0 } : p)}
                              className="h-8 px-2 rounded-md bg-background border border-border text-[12px] text-foreground font-mono focus:outline-none focus:border-primary" />
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button size="sm" className="h-8 w-8 p-0" onClick={saveEdit}><Check className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={cancelEdit}><X className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={item.id} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/40 transition-colors group">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-accent shrink-0 border border-border">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground/40" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] font-medium text-foreground">{item.name}</h3>
                          {item.nameZh && <p className="text-[11px] text-muted-foreground mt-0.5">{item.nameZh}</p>}
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.modifierGroups?.length || 0} modifier groups</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-semibold text-foreground font-mono">${item.price.toFixed(2)}</span>
                          <button onClick={() => toggleAvailability(item.id)}
                            className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors",
                              item.available ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red")}>
                            {item.available ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                            {item.available ? "Active" : "Off"}
                          </button>
                          <button onClick={() => startEdit(item)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors opacity-0 group-hover:opacity-100">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent shrink-0 border border-border">
                    {combo.image ? (
                      <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground/40" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-foreground">{combo.name}</h3>
                      <span className="text-[10px] font-bold text-primary bg-status-blue-light px-2 py-0.5 rounded-md">COMBO</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{combo.comboGroups?.length || 0} selection groups</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-bold text-primary font-mono">${combo.price.toFixed(2)}</span>
                    <button onClick={() => toggleAvailability(combo.id)}
                      className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors",
                        combo.available ? "bg-status-green-light text-status-green" : "bg-status-red-light text-status-red")}>
                      {combo.available ? "Active" : "Off"}
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {combo.comboGroups && (
                  <div className="border-t border-border px-5 py-3 bg-accent/30">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {combo.comboGroups.map(group => {
                        const groupItems = items.filter(m => group.allowedItems.includes(m.id));
                        return (
                          <div key={group.id} className="bg-card rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">{group.name}</span>
                              <span className="text-[10px] text-muted-foreground">{group.required ? "Required" : "Optional"} · max {group.maxSelect}</span>
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

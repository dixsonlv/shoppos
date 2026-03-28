import React, { useState } from "react";
import { X, Check, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type MenuItem, type ModifierGroup, menuItems as allMenuItems } from "@/data/mock-data";
import { useLanguage } from "@/hooks/useLanguage";

interface ModifierDialogProps {
  item: MenuItem;
  groups: ModifierGroup[];
  onConfirm: (modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => void;
  onCancel: () => void;
}

export const ModifierDialog: React.FC<ModifierDialogProps> = ({ item, groups, onConfirm, onCancel }) => {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [comboSelections, setComboSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const toggleOption = (groupId: string, optionId: string, multiSelect: boolean) => {
    setSelected(prev => {
      const current = prev[groupId] || [];
      if (multiSelect) {
        return { ...prev, [groupId]: current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId] };
      }
      return { ...prev, [groupId]: [optionId] };
    });
  };

  const toggleComboItem = (groupId: string, itemId: string, maxSelect: number) => {
    setComboSelections(prev => {
      const current = prev[groupId] || [];
      if (current.includes(itemId)) return { ...prev, [groupId]: current.filter(id => id !== itemId) };
      if (current.length >= maxSelect) {
        if (maxSelect === 1) return { ...prev, [groupId]: [itemId] };
        return prev;
      }
      return { ...prev, [groupId]: [...current, itemId] };
    });
  };

  const modifierValid = groups.filter(g => g.required).every(g => (selected[g.id] || []).length > 0);
  const comboValid = !item.isCombo || (item.comboGroups || []).filter(g => g.required).every(g => {
    const sel = comboSelections[g.id] || [];
    return sel.length >= (g.maxSelect > 0 ? Math.min(g.maxSelect, 1) : 1);
  });
  const isValid = modifierValid && comboValid;

  const handleConfirm = () => {
    const modifiers: { name: string; price: number }[] = [];
    Object.entries(selected).forEach(([groupId, optionIds]) => {
      const group = groups.find(g => g.id === groupId);
      optionIds.forEach(optId => {
        const opt = group?.options.find(o => o.id === optId);
        if (opt) modifiers.push({ name: opt.name, price: opt.price });
      });
    });
    let comboItems: { name: string; groupName: string }[] | undefined;
    if (item.isCombo && item.comboGroups) {
      comboItems = [];
      item.comboGroups.forEach(cg => {
        const selectedIds = comboSelections[cg.id] || [];
        selectedIds.forEach(id => {
          const mi = allMenuItems.find(m => m.id === id);
          if (mi) comboItems!.push({ name: mi.name, groupName: cg.name });
        });
      });
    }
    onConfirm(modifiers, notes || undefined, comboItems);
  };

  const getItemName = (mi: MenuItem) => lang === "zh" && mi.nameZh ? mi.nameZh : mi.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-card rounded-2xl shadow-2xl w-[420px] max-h-[80vh] overflow-y-auto pos-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          {item.isCombo && (
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-bold px-2 py-0.5 rounded-md mb-2">
              {item.isFlexCombo ? <Zap className="w-3 h-3" /> : <Package className="w-3 h-3" />}
              {item.isFlexCombo ? t("flexible_combo") : t("combo")}
            </span>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">{getItemName(item)}</h3>
            <span className="text-lg font-bold text-foreground font-mono">${item.price.toFixed(2)}</span>
          </div>

          {/* Combo selections */}
          {item.isCombo && item.comboGroups && item.comboGroups.map(cg => {
            const selectedIds = comboSelections[cg.id] || [];
            return (
              <div key={cg.id} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-foreground">{lang === "zh" && cg.nameZh ? cg.nameZh : cg.name}</span>
                  <span className="text-[11px] text-primary font-semibold">{t("required")} {selectedIds.length}/{cg.maxSelect}</span>
                </div>
                <div className="space-y-1.5">
                  {cg.allowedItems.map(itemId => {
                    const mi = allMenuItems.find(m => m.id === itemId);
                    if (!mi) return null;
                    const isSel = selectedIds.includes(itemId);
                    return (
                      <button key={itemId} onClick={() => toggleComboItem(cg.id, itemId, cg.maxSelect)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-[12px] transition-all border-1.5 min-h-[44px]",
                          isSel ? "bg-status-blue-light border-primary text-foreground" : "bg-card border-border text-foreground hover:bg-accent"
                        )}>
                        {mi.image && <img src={mi.image} className="w-8 h-8 rounded-md object-cover" alt="" />}
                        <span className="flex-1 text-left">{getItemName(mi)}</span>
                        {isSel && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Regular modifier groups */}
          {groups.map(group => (
            <div key={group.id} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold text-foreground">{lang === "zh" && group.nameZh ? group.nameZh : group.name}</span>
                <div className="flex items-center gap-2">
                  {group.required && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{t("required")}</span>}
                  <span className="text-[11px] text-muted-foreground">{group.multiSelect ? t("select_multiple") : t("select_one")}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {group.options.map(opt => {
                  const isSelected = (selected[group.id] || []).includes(opt.id);
                  return (
                    <button key={opt.id} onClick={() => toggleOption(group.id, opt.id, group.multiSelect)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-[13px] transition-all border-1.5 min-h-[44px]",
                        isSelected ? "bg-status-blue-light border-primary text-foreground" : "bg-card border-border text-foreground hover:bg-accent"
                      )}>
                      <span>{lang === "zh" && opt.nameZh ? opt.nameZh : opt.name}</span>
                      <div className="flex items-center gap-2">
                        {opt.price > 0 && <span className="text-muted-foreground font-mono">+${opt.price.toFixed(2)}</span>}
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div className="mb-4">
            <label className="text-[13px] font-bold text-foreground mb-1.5 block">{t("special_notes")}</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder={t("notes_placeholder")}
              className="w-full h-16 px-3 py-2 rounded-lg border-1.5 border-border bg-background text-[13px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} className="flex-1 h-12 min-h-[44px]">{t("cancel")}</Button>
            <Button onClick={handleConfirm} disabled={!isValid} className="flex-1 h-12 bg-primary text-primary-foreground min-h-[44px]">{t("add_to_order")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

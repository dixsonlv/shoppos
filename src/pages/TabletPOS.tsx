import React, { useState, useCallback } from "react";
import { Receipt } from "lucide-react";
import { FloorPanel } from "@/components/tablet/FloorPanel";
import { MenuComposer } from "@/components/tablet/MenuComposer";
import { CheckPanel } from "@/components/tablet/CheckPanel";
import { PaymentSheet } from "@/components/tablet/PaymentSheet";
import { OrderHistory, type PaidOrder } from "@/components/tablet/OrderHistory";
import { tables as mockTables, sampleOrders, menuItems, type Table, type Order, type OrderItem, type ServiceMode } from "@/data/mock-data";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/hooks/useLanguage";

// Generate 30 mock paid orders for history
const generateMockPaidOrders = (): PaidOrder[] => {
  const methods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];
  const modes: ("dine-in" | "takeaway" | "delivery" | "pickup")[] = ["dine-in", "takeaway", "delivery", "dine-in", "takeaway", "dine-in"];
  const items = [
    { name: "Chicken Rice", price: 5.50 }, { name: "Laksa", price: 7.00 }, { name: "Char Kway Teow", price: 6.50 },
    { name: "Nasi Lemak", price: 6.50 }, { name: "Teh Tarik", price: 2.50 }, { name: "Tiger Beer", price: 10.00 },
    { name: "Satay (10pc)", price: 12.00 }, { name: "Hokkien Mee", price: 7.50 }, { name: "Chilli Crab", price: 38.00 },
    { name: "Bak Kut Teh", price: 9.80 }, { name: "Milo Dinosaur", price: 4.00 }, { name: "Ice Kachang", price: 4.00 },
  ];
  const orders: PaidOrder[] = [];
  for (let i = 0; i < 30; i++) {
    const numItems = 2 + Math.floor(Math.random() * 4);
    const orderItems = [];
    for (let j = 0; j < numItems; j++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      orderItems.push({ name: item.name, quantity: qty, price: item.price, modifiers: [] as { name: string; price: number }[] });
    }
    const subtotal = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const discount = Math.random() > 0.8 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
    const serviceCharge = (subtotal - discount) * 0.1;
    const gst = (subtotal - discount + serviceCharge) * 0.09;
    const total = Math.round((subtotal - discount + serviceCharge + gst) * 100) / 100;
    const method = methods[Math.floor(Math.random() * methods.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const hoursAgo = i * 2 + Math.floor(Math.random() * 3);
    const paidAt = new Date(Date.now() - hoursAgo * 3600000).toISOString();
    const isCash = method === "Cash";
    const cashReceived = isCash ? Math.ceil(total / 10) * 10 : undefined;
    const changeDue = isCash && cashReceived ? Math.round((cashReceived - total) * 100) / 100 : undefined;
    orders.push({
      id: `hist-${i}`, tableNumber: mode === "dine-in" ? String(1 + Math.floor(Math.random() * 18)) : undefined,
      serviceMode: mode, items: orderItems, subtotal, discount,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      gst: Math.round(gst * 100) / 100, total, paidAt, paymentMethod: method,
      cashReceived, changeDue,
    });
  }
  return orders;
};

const TabletPOS: React.FC = () => {
  const { t } = useLanguage();
  const [tables, setTables] = useState(mockTables);
  const [orders, setOrders] = useState(sampleOrders);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [paidOrders, setPaidOrders] = useState<PaidOrder[]>(generateMockPaidOrders);
  const [floorFullscreen, setFloorFullscreen] = useState(false);
  const [tableManagementEnabled, setTableManagementEnabled] = useState(true);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const handleSelectTable = useCallback((tableId: string) => {
    setSelectedTableId(tableId);
    setFloorFullscreen(false);
    const table = tables.find(t => t.id === tableId);
    if (table?.orderId) {
      const order = orders.find(o => o.id === table.orderId);
      setCurrentOrder(order || null);
    } else if (table?.status === "available") {
      const newOrder: Order = {
        id: `o-${Date.now()}`, tableId, tableNumber: table.number, serviceMode: "dine-in",
        items: [], status: "open", guestCount: 1, createdAt: new Date().toISOString(),
        subtotal: 0, serviceCharge: 0, gst: 0, total: 0,
      };
      setCurrentOrder(newOrder);
      setOrders(prev => [...prev, newOrder]);
      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, status: "ordering" as const, guestCount: 1, orderId: newOrder.id, elapsedMinutes: 0 } : t
      ));
    } else {
      setCurrentOrder(null);
    }
  }, [tables, orders]);

  const handleCreateWalkIn = useCallback((mode: ServiceMode) => {
    const newOrder: Order = {
      id: `o-${Date.now()}`, serviceMode: mode, items: [], status: "open", guestCount: 1,
      createdAt: new Date().toISOString(), subtotal: 0, serviceCharge: 0, gst: 0, total: 0,
    };
    setCurrentOrder(newOrder);
    setOrders(prev => [...prev, newOrder]);
    setSelectedTableId(null);
  }, []);

  const recalcOrder = (items: OrderItem[]): Pick<Order, "subtotal" | "serviceCharge" | "gst" | "total"> => {
    const subtotal = items.reduce((sum, item) => {
      const modTotal = item.modifiers.reduce((ms, m) => ms + m.price, 0);
      return sum + (item.price + modTotal) * item.quantity;
    }, 0);
    const serviceCharge = subtotal * 0.1;
    const gst = (subtotal + serviceCharge) * 0.09;
    return { subtotal, serviceCharge, gst, total: subtotal + serviceCharge + gst };
  };

  const handleAddItem = useCallback((menuItemId: string, modifiers: { name: string; price: number }[], notes?: string, comboItems?: { name: string; groupName: string }[]) => {
    if (!currentOrder) return;
    const menuItem = menuItems.find(m => m.id === menuItemId);
    if (!menuItem) return;
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const existing = !comboItems && prev.items.find(i => i.menuItemId === menuItemId && JSON.stringify(i.modifiers) === JSON.stringify(modifiers) && i.notes === notes);
      let newItems: OrderItem[];
      if (existing) {
        newItems = prev.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        const newItem: OrderItem = {
          id: `oi-${Date.now()}`, menuItemId, name: menuItem.name, price: menuItem.price,
          quantity: 1, modifiers, notes, status: "new", comboItems,
        };
        newItems = [...prev.items, newItem];
      }
      return { ...prev, items: newItems, ...recalcOrder(newItems) };
    });
  }, [currentOrder]);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0);
      return { ...prev, items: newItems, ...recalcOrder(newItems) };
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setCurrentOrder(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter(i => i.id !== itemId);
      return { ...prev, items: newItems, ...recalcOrder(newItems) };
    });
  }, []);

  const handlePaymentComplete = useCallback((method?: string) => {
    if (currentOrder) {
      const paymentMethods = ["Visa", "Mastercard", "UnionPay", "Alipay", "WeChat Pay", "PayNow", "Cash"];
      const pm = method || paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paid: PaidOrder = {
        id: currentOrder.id, tableNumber: currentOrder.tableNumber, serviceMode: currentOrder.serviceMode,
        items: currentOrder.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price, modifiers: i.modifiers })),
        subtotal: currentOrder.subtotal, discount: 0, serviceCharge: currentOrder.serviceCharge,
        gst: currentOrder.gst, total: currentOrder.total, paidAt: new Date().toISOString(), paymentMethod: pm,
      };
      setPaidOrders(prev => [paid, ...prev]);
    }
    setShowPayment(false);
    if (currentOrder?.tableId) {
      setTables(prev => prev.map(t =>
        t.id === currentOrder.tableId ? { ...t, status: "dirty" as const, guestCount: undefined, openAmount: undefined, orderId: undefined, elapsedMinutes: undefined } : t
      ));
    }
    setCurrentOrder(null);
    setSelectedTableId(null);
  }, [currentOrder]);

  const handleTransferTable = useCallback((fromId: string, toId: string) => {
    setTables(prev => {
      const fromTable = prev.find(t => t.id === fromId);
      if (!fromTable) return prev;
      return prev.map(t => {
        if (t.id === fromId) return { ...t, status: "available" as const, guestCount: undefined, server: undefined, openAmount: undefined, elapsedMinutes: undefined, orderId: undefined };
        if (t.id === toId) return { ...t, status: fromTable.status, guestCount: fromTable.guestCount, server: fromTable.server, openAmount: fromTable.openAmount, elapsedMinutes: fromTable.elapsedMinutes, orderId: fromTable.orderId };
        return t;
      });
    });
  }, []);

  const handleMergeTables = useCallback((tableIds: string[]) => {
    if (tableIds.length < 2) return;
    const primary = tableIds[0];
    const others = tableIds.slice(1);
    setTables(prev => prev.map(t => {
      if (t.id === primary) {
        const totalSeats = tableIds.reduce((sum, id) => sum + (prev.find(x => x.id === id)?.seats || 0), 0);
        return { ...t, seats: totalSeats, mergedWith: others };
      }
      if (others.includes(t.id)) return { ...t, status: "available" as const, mergedWith: undefined };
      return t;
    }));
  }, []);

  const handleSplitTable = useCallback((tableId: string, count: number) => {
    setTables(prev => {
      const table = prev.find(t => t.id === tableId);
      if (!table) return prev;
      const seatsEach = Math.max(2, Math.floor(table.seats / count));
      const newTables: Table[] = [];
      for (let i = 1; i < count; i++) {
        newTables.push({ id: `${tableId}-s${i}`, number: `${table.number}${String.fromCharCode(65 + i)}`, zone: table.zone, seats: seatsEach, status: "available" });
      }
      return [...prev.map(t => t.id === tableId ? { ...t, seats: seatsEach, number: `${table.number}A` } : t), ...newTables];
    });
  }, []);

  // If showing history, replace right panel content
  if (showHistory) {
    return (
      <div className="h-screen w-screen flex overflow-hidden select-none" style={{ touchAction: "none" }}>
        {/* Left: Floor Panel */}
        <div className="w-[280px] flex-shrink-0 border-r border-border bg-card flex flex-col">
          <FloorPanel
            tables={tables} selectedTableId={selectedTableId} onSelectTable={handleSelectTable}
            onCreateWalkIn={handleCreateWalkIn} onTransferTable={handleTransferTable}
            onMergeTables={handleMergeTables} onSplitTable={handleSplitTable}
            isFullscreen={false} onToggleFullscreen={() => {}} tableManagementEnabled={tableManagementEnabled}
          />
        </div>
        {/* Right: Order History — side panel, NOT modal */}
        <div className="flex-1 flex flex-col">
          <OrderHistory orders={paidOrders} onClose={() => setShowHistory(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden select-none" style={{ touchAction: "none" }}>
      {/* Left: Floor Panel */}
      <div className={cn(
        "flex-shrink-0 border-r border-border bg-card flex flex-col transition-all",
        floorFullscreen ? "w-full" : "w-[280px]"
      )}>
        <FloorPanel
          tables={tables} selectedTableId={selectedTableId} onSelectTable={handleSelectTable}
          onCreateWalkIn={handleCreateWalkIn} onTransferTable={handleTransferTable}
          onMergeTables={handleMergeTables} onSplitTable={handleSplitTable}
          isFullscreen={floorFullscreen} onToggleFullscreen={() => setFloorFullscreen(f => !f)}
          tableManagementEnabled={tableManagementEnabled}
        />
      </div>
      {!floorFullscreen && (
        <>
          {/* Center: Menu */}
          <div className="flex-1 flex flex-col border-r border-border bg-background">
            <MenuComposer onAddItem={handleAddItem} selectedTable={selectedTable} currentOrder={currentOrder} />
          </div>
          {/* Right: Check */}
          <div className="w-[280px] flex-shrink-0 bg-card flex flex-col">
            <CheckPanel order={currentOrder} table={selectedTable} onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem} onPay={() => setShowPayment(true)} />
          </div>
        </>
      )}

      {/* Top-right controls */}
      <div className="fixed top-2 right-3 z-40 flex items-center gap-1">
        <ThemeToggle />
        <button onClick={() => setShowHistory(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border-1.5 border-border text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[44px] active:scale-95">
          <Receipt className="w-4 h-4" />
          {t("history")}
          {paidOrders.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
              {paidOrders.length}
            </span>
          )}
        </button>
      </div>

      {showPayment && currentOrder && (
        <PaymentSheet order={currentOrder} onClose={() => setShowPayment(false)} onComplete={handlePaymentComplete} />
      )}
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default TabletPOS;

import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type Item = { id: string; name: string; price: number; emoji: string };

const ITEMS: Item[] = [
  { id: "pizzatester", name: "Pizzatester", price: 250, emoji: "🍕" },
  { id: "maggi", name: "Maggi", price: 60, emoji: "🍜" },
  { id: "cupcakedev", name: "Cupcakedev", price: 80, emoji: "🧁" },
  { id: "burger", name: "Burger", price: 150, emoji: "🍔" },
  { id: "fries", name: "Fries", price: 100, emoji: "🍟" },
  { id: "coffee", name: "Coffee", price: 90, emoji: "☕" },
];

type BillRecord = {
  timestamp: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
};

const Index = () => {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [accepted, setAccepted] = useState(false);
  const [bill, setBill] = useState<BillRecord | null>(null);

  const updateQty = (id: string, delta: number) => {
    setQty((prev) => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: next };
    });
  };

  const total = ITEMS.reduce((sum, it) => sum + (qty[it.id] || 0) * it.price, 0);
  const selectedCount = Object.values(qty).reduce((a, b) => a + b, 0);

  const saveBillToStorage = (record: BillRecord) => {
    const existing = JSON.parse(localStorage.getItem("billRecords") || "[]");
    existing.push(record);
    localStorage.setItem("billRecords", JSON.stringify(existing));
  };

  const handleConfirm = () => {
    if (selectedCount === 0) {
      toast({ title: "Please select at least one item", variant: "destructive" });
      return;
    }
    if (!accepted) {
      toast({ title: "Please accept our terms", variant: "destructive" });
      return;
    }
    const record: BillRecord = {
      timestamp: new Date().toISOString(),
      items: ITEMS.filter((it) => qty[it.id] > 0).map((it) => ({
        name: it.name,
        qty: qty[it.id],
        price: it.price,
      })),
      total,
    };
    saveBillToStorage(record);
    setBill(record);
    toast({ title: "Order confirmed & bill saved!" });
  };

  const handleDownloadRecords = () => {
    const records = localStorage.getItem("billRecords") || "[]";
    const parsed: BillRecord[] = JSON.parse(records);
    const text =
      parsed
        .map(
          (r, i) =>
            `Bill #${i + 1}\nTimestamp: ${r.timestamp}\n` +
            r.items.map((it) => `  ${it.name} x${it.qty} = ₹${it.qty * it.price}`).join("\n") +
            `\nTotal: ₹${r.total}\n`
        )
        .join("\n----------------------\n") || "No records yet.";
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill-records-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewOrder = () => {
    setQty({});
    setAccepted(false);
    setBill(null);
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
          🍽️ Quick Order
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Please select items
        </p>

        {!bill ? (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-3">
              {ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">₹{item.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-8 h-8 rounded-md border border-border hover:bg-muted text-foreground"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium text-foreground">
                      {qty[item.id] || 0}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-8 h-8 rounded-md border border-border hover:bg-muted text-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-foreground font-medium">Subtotal</span>
              <span className="text-xl font-bold text-foreground">₹{total}</span>
            </div>

            <label className="flex items-center gap-2 mt-4 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-4 h-4"
              />
              I accept the terms and conditions
            </label>

            <button
              onClick={handleConfirm}
              className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition"
            >
              Confirm Order
            </button>

            <button
              onClick={handleDownloadRecords}
              className="mt-2 w-full bg-secondary text-secondary-foreground py-2 rounded-md text-sm hover:opacity-90 transition"
            >
              📥 Download All Bill Records
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-center mb-4 text-foreground">
              🧾 Bill
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {new Date(bill.timestamp).toLocaleString()}
            </p>
            <div className="space-y-2 border-t border-b border-border py-4">
              {bill.items.map((it, i) => (
                <div key={i} className="flex justify-between text-foreground">
                  <span>
                    {it.name} × {it.qty}
                  </span>
                  <span>₹{it.qty * it.price}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xl font-bold text-foreground">
              <span>Total</span>
              <span>₹{bill.total}</span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              ✓ Bill saved to records
            </p>
            <button
              onClick={handleNewOrder}
              className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition"
            >
              New Order
            </button>
            <button
              onClick={handleDownloadRecords}
              className="mt-2 w-full bg-secondary text-secondary-foreground py-2 rounded-md text-sm hover:opacity-90 transition"
            >
              📥 Download All Bill Records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

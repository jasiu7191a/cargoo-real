"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, MailCheck, PackageCheck, RefreshCw, Save, Send, Truck } from "lucide-react";

type QuoteRequest = {
  id: string;
  user_id: string;
  customer_email: string;
  product_link: string | null;
  product_description: string | null;
  selected_items: any[];
  status: string;
  quote_id: string | null;
  quote_status: string | null;
  shipment_status: string | null;
  order_number: string | null;
  created_at: string;
};

type Quote = {
  id?: string;
  quote_request_id?: string;
  user_id?: string;
  product_name: string;
  product_link: string;
  product_image_url: string;
  product_cost: string;
  shipping_cost: string;
  customs_cost: string;
  service_fee: string;
  total_price: string;
  currency: string;
  estimated_delivery: string;
  notes: string;
  payment_instructions: string;
  status: string;
  expires_at: string;
};

type Shipment = {
  id?: string;
  quote_id: string;
  user_id: string;
  order_number: string;
  tracking_number: string;
  carrier: string;
  status: string;
  last_update: string;
  estimated_delivery: string;
};

const emptyQuote: Quote = {
  product_name: "",
  product_link: "",
  product_image_url: "",
  product_cost: "",
  shipping_cost: "",
  customs_cost: "",
  service_fee: "",
  total_price: "",
  currency: "EUR",
  estimated_delivery: "",
  notes: "",
  payment_instructions: "",
  status: "draft",
  expires_at: "",
};

const shipmentStatuses = [
  "quote_requested",
  "paid",
  "sourcing",
  "quality_check",
  "shipped_from_china",
  "customs",
  "out_for_delivery",
  "delivered",
];

function getCsrfToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("cargoo_csrf="))
    ?.split("=")[1] || "";
}

async function apiJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isWrite = options.method && options.method !== "GET";
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(isWrite ? { "x-csrf-token": getCsrfToken() } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

function selectedItemsLabel(items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return "No selected catalog items";
  return items.map((item) => `${item.name || item.code || "Item"} x${item.quantity || 1}`).join(", ");
}

function numberValue(value: string) {
  return value === "" ? null : Number(value);
}

export function QuoteRequestsPanel() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [quote, setQuote] = useState<Quote>(emptyQuote);
  const [shipment, setShipment] = useState<Shipment>({
    quote_id: "",
    user_id: "",
    order_number: "",
    tracking_number: "",
    carrier: "",
    status: "quote_requested",
    last_update: "",
    estimated_delivery: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selectedItems = Array.isArray(selected?.selected_items) ? selected!.selected_items : [];
  const selectedSummary = useMemo(() => selectedItemsLabel(selectedItems), [selectedItems]);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await apiJson<{ quoteRequests: QuoteRequest[] }>("/api/admin/quote-requests");
      setRequests(data.quoteRequests);
      if (!selected && data.quoteRequests.length) {
        await openRequest(data.quoteRequests[0], data.quoteRequests);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openRequest(request: QuoteRequest, allRequests = requests) {
    setSelected(request);
    setError("");
    setNotice("");
    const firstItem = Array.isArray(request.selected_items) ? request.selected_items[0] : null;
    try {
      const detail = await apiJson<{ quotes: any[]; shipments: any[] }>(`/api/admin/quote-requests/${request.id}`);
      const existingQuote = detail.quotes?.[0];
      if (existingQuote) {
        setQuote({
          id: existingQuote.id,
          quote_request_id: existingQuote.quote_request_id,
          user_id: existingQuote.user_id,
          product_name: existingQuote.product_name || "",
          product_link: existingQuote.product_link || "",
          product_image_url: existingQuote.product_image_url || "",
          product_cost: existingQuote.product_cost || "",
          shipping_cost: existingQuote.shipping_cost || "",
          customs_cost: existingQuote.customs_cost || "",
          service_fee: existingQuote.service_fee || "",
          total_price: existingQuote.total_price || "",
          currency: existingQuote.currency || "EUR",
          estimated_delivery: existingQuote.estimated_delivery || "",
          notes: existingQuote.notes || "",
          payment_instructions: existingQuote.payment_instructions || "",
          status: existingQuote.status || "draft",
          expires_at: existingQuote.expires_at ? existingQuote.expires_at.slice(0, 10) : "",
        });
      } else {
        setQuote({
          ...emptyQuote,
          quote_request_id: request.id,
          user_id: request.user_id,
          product_name: firstItem?.name || request.product_description || "",
          product_link: firstItem?.productUrl || request.product_link || "",
        });
      }

      const existingShipment = detail.shipments?.[0];
      setShipment({
        id: existingShipment?.id,
        quote_id: existingQuote?.id || "",
        user_id: request.user_id,
        order_number: existingShipment?.order_number || "",
        tracking_number: existingShipment?.tracking_number || "",
        carrier: existingShipment?.carrier || "",
        status: existingShipment?.status || "quote_requested",
        last_update: existingShipment?.last_update || "",
        estimated_delivery: existingShipment?.estimated_delivery || "",
      });
    } catch (err: any) {
      setError(err.message);
      const fallback = allRequests.find((item) => item.id === request.id) || request;
      setQuote({
        ...emptyQuote,
        quote_request_id: fallback.id,
        user_id: fallback.user_id,
        product_name: firstItem?.name || fallback.product_description || "",
        product_link: firstItem?.productUrl || fallback.product_link || "",
      });
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setQuoteField(field: keyof Quote, value: string) {
    setQuote((prev) => {
      const next = { ...prev, [field]: value };
      if (["product_cost", "shipping_cost", "customs_cost", "service_fee"].includes(field)) {
        const total =
          Number(next.product_cost || 0) +
          Number(next.shipping_cost || 0) +
          Number(next.customs_cost || 0) +
          Number(next.service_fee || 0);
        next.total_price = total ? total.toFixed(2) : next.total_price;
      }
      return next;
    });
  }

  async function saveQuote() {
    if (!selected) return null;
    setBusy("save");
    setError("");
    setNotice("");
    try {
      const payload = {
        ...quote,
        quote_request_id: selected.id,
        user_id: selected.user_id,
        product_cost: numberValue(quote.product_cost),
        shipping_cost: numberValue(quote.shipping_cost),
        customs_cost: numberValue(quote.customs_cost),
        service_fee: numberValue(quote.service_fee),
        total_price: numberValue(quote.total_price),
        expires_at: quote.expires_at || null,
      };
      const data = quote.id
        ? await apiJson<{ quote: any }>(`/api/admin/quotes/${quote.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await apiJson<{ quote: any }>("/api/admin/quotes", { method: "POST", body: JSON.stringify(payload) });

      setQuote((prev) => ({ ...prev, id: data.quote.id, status: data.quote.status || prev.status }));
      setShipment((prev) => ({ ...prev, quote_id: data.quote.id }));
      setNotice("Quote draft saved.");
      await loadRequests();
      return data.quote;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setBusy("");
    }
  }

  async function sendQuote() {
    const saved = quote.id ? quote : await saveQuote();
    const quoteId = quote.id || saved?.id;
    if (!quoteId) return;
    setBusy("send");
    setError("");
    setNotice("");
    try {
      const data = await apiJson<{ message?: string; warning?: string; quote: any }>(`/api/admin/quotes/${quoteId}/send`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setQuote((prev) => ({ ...prev, id: data.quote.id, status: data.quote.status || "sent" }));
      setNotice(data.warning || data.message || "Quote sent.");
      await loadRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function generateSummary() {
    if (!selected) return;
    setBusy("gemini");
    setError("");
    setNotice("");
    try {
      const data = await apiJson<{ summary: any }>("/api/admin/quotes/generate-summary", {
        method: "POST",
        body: JSON.stringify({
          product_link: selected.product_link,
          product_description: selected.product_description,
          selected_items: selected.selected_items,
          draft_quote_fields: quote,
        }),
      });
      setQuote((prev) => ({
        ...prev,
        product_name: prev.product_name || data.summary.product_summary || "",
        notes: data.summary.customer_notes || prev.notes,
      }));
      setNotice("Gemini summary generated. Review it before saving.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function createShipment() {
    if (!selected) return;
    setBusy("shipment");
    setError("");
    setNotice("");
    try {
      const payload = { ...shipment, user_id: selected.user_id, quote_id: quote.id || shipment.quote_id || null };
      const data = shipment.id
        ? await apiJson<{ shipment: any }>(`/api/admin/shipments/${shipment.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : await apiJson<{ shipment: any }>("/api/admin/shipments", { method: "POST", body: JSON.stringify(payload) });
      setShipment((prev) => ({ ...prev, id: data.shipment.id }));
      setNotice(shipment.id ? "Shipment record updated." : "Shipment record saved.");
      await loadRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#ff5500]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(320px,420px)_1fr] gap-6">
      <div className="glass-panel border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#ff5500] font-black">Quote Requests</div>
            <div className="text-sm text-[#94a3b8]">{requests.length} customer requests</div>
          </div>
          <button onClick={loadRequests} className="p-2 rounded-xl bg-white/5 hover:bg-white/10" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto divide-y divide-white/5">
          {requests.map((request) => (
            <button
              key={request.id}
              onClick={() => openRequest(request)}
              className={`w-full text-left p-5 transition-colors ${selected?.id === request.id ? "bg-[#ff5500]/10" : "hover:bg-white/[0.03]"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold text-white truncate">{request.customer_email}</div>
                <span className="text-[10px] uppercase font-black text-[#ff5500]">{request.status}</span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-2 line-clamp-2">
                {request.product_description || request.product_link || selectedItemsLabel(request.selected_items)}
              </p>
              <div className="flex gap-2 mt-3 text-[10px] uppercase tracking-wider text-white/40">
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
                {request.quote_status && <span>Quote: {request.quote_status}</span>}
                {request.shipment_status && <span>Ship: {request.shipment_status}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {notice && <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm font-bold text-green-300">{notice}</div>}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300">{error}</div>}

        {selected ? (
          <>
            <section className="glass-panel border-white/10 p-6 space-y-4">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#ff5500] font-black">Customer email</div>
                  <div className="text-xl font-black">{selected.customer_email}</div>
                </div>
                <div className="text-right text-xs text-[#94a3b8]">
                  <div>ID: {selected.id}</div>
                  <div>{new Date(selected.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Product link" value={selected.product_link || "None"} />
                <Info label="Selected items" value={selectedSummary} />
                <Info label="Description" value={selected.product_description || "None"} wide />
              </div>
            </section>

            <section className="glass-panel border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase italic">Create quote</h2>
                  <p className="text-sm text-[#94a3b8]">Save a draft or send directly to the customer account and email.</p>
                </div>
                <button
                  onClick={generateSummary}
                  disabled={busy === "gemini"}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-xs font-black uppercase text-[#ff5500] hover:bg-white/10 disabled:opacity-50"
                >
                  <Bot size={16} /> Generate quote summary
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Product name" value={quote.product_name} onChange={(value) => setQuoteField("product_name", value)} />
                <Field label="Product link" value={quote.product_link} onChange={(value) => setQuoteField("product_link", value)} />
                <Field label="Product image URL" value={quote.product_image_url} onChange={(value) => setQuoteField("product_image_url", value)} />
                <Field label="Currency" value={quote.currency} onChange={(value) => setQuoteField("currency", value.toUpperCase())} />
                <Field label="Product cost" type="number" value={quote.product_cost} onChange={(value) => setQuoteField("product_cost", value)} />
                <Field label="Shipping cost" type="number" value={quote.shipping_cost} onChange={(value) => setQuoteField("shipping_cost", value)} />
                <Field label="Customs/VAT" type="number" value={quote.customs_cost} onChange={(value) => setQuoteField("customs_cost", value)} />
                <Field label="Service fee" type="number" value={quote.service_fee} onChange={(value) => setQuoteField("service_fee", value)} />
                <Field label="Total price" type="number" value={quote.total_price} onChange={(value) => setQuoteField("total_price", value)} />
                <Field label="Estimated delivery" value={quote.estimated_delivery} onChange={(value) => setQuoteField("estimated_delivery", value)} />
                <Field label="Expiry date" type="date" value={quote.expires_at} onChange={(value) => setQuoteField("expires_at", value)} />
                <label className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">Status</span>
                  <select value={quote.status} onChange={(e) => setQuoteField("status", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold outline-none focus:border-[#ff5500]">
                    {["draft", "sent", "accepted", "rejected", "expired", "paid", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <Textarea label="Quote notes" value={quote.notes} onChange={(value) => setQuoteField("notes", value)} />
                <Textarea label="Payment instructions" value={quote.payment_instructions} onChange={(value) => setQuoteField("payment_instructions", value)} />
              </div>

              <div className="flex gap-3">
                <button onClick={saveQuote} disabled={!!busy} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-4 text-xs font-black uppercase hover:bg-white/15 disabled:opacity-50">
                  <Save size={16} /> Save draft
                </button>
                <button onClick={sendQuote} disabled={!!busy} className="inline-flex items-center gap-2 rounded-2xl bg-[#ff5500] px-5 py-4 text-xs font-black uppercase text-black hover:scale-[1.01] disabled:opacity-50">
                  <Send size={16} /> Send to account and email
                </button>
                {quote.status === "sent" && <span className="inline-flex items-center gap-2 text-green-300 text-xs font-black uppercase"><MailCheck size={16} /> Quote sent</span>}
              </div>
            </section>

            <section className="glass-panel border-white/10 p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Truck className="text-[#ff5500]" />
                <div>
                  <h2 className="text-2xl font-black uppercase italic">Shipment</h2>
                  <p className="text-sm text-[#94a3b8]">Create shipment/order records after acceptance or payment.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Order number" value={shipment.order_number} onChange={(value) => setShipment((prev) => ({ ...prev, order_number: value }))} />
                <Field label="Tracking number" value={shipment.tracking_number} onChange={(value) => setShipment((prev) => ({ ...prev, tracking_number: value }))} />
                <Field label="Carrier" value={shipment.carrier} onChange={(value) => setShipment((prev) => ({ ...prev, carrier: value }))} />
                <label className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">Shipment status</span>
                  <select value={shipment.status} onChange={(e) => setShipment((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold outline-none focus:border-[#ff5500]">
                    {shipmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <Field label="Estimated delivery" value={shipment.estimated_delivery} onChange={(value) => setShipment((prev) => ({ ...prev, estimated_delivery: value }))} />
                <Textarea label="Last update" value={shipment.last_update} onChange={(value) => setShipment((prev) => ({ ...prev, last_update: value }))} />
              </div>
              <button onClick={createShipment} disabled={!!busy} className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-4 text-xs font-black uppercase hover:bg-white/15 disabled:opacity-50">
                <PackageCheck size={16} /> {shipment.id ? "Update shipment" : "Create shipment"}
              </button>
            </section>
          </>
        ) : (
          <div className="glass-panel border-white/10 p-12 text-center text-[#94a3b8]">
            No quote requests yet.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-2">
      <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">{label}</span>
      <input
        type={type}
        value={value}
        step={type === "number" ? "0.01" : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold outline-none focus:border-[#ff5500]"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 col-span-2">
      <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold outline-none focus:border-[#ff5500]"
      />
    </label>
  );
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-[#ff5500] font-black">{label}</div>
      <div className="mt-1 break-words text-white/80">{value}</div>
    </div>
  );
}

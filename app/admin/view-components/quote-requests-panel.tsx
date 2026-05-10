"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MailCheck, PackageCheck, RefreshCw, Save, Send, Truck } from "lucide-react";

type QuoteRequest = {
  id: string;
  user_id: string;
  customer_email: string;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_phone?: string | null;
  product_link: string | null;
  product_description: string | null;
  selected_items: any[];
  quantity?: number | null;
  category?: string | null;
  contact_phone?: string | null;
  delivery_address_id?: string | null;
  street?: string | null;
  city?: string | null;
  zip_code?: string | null;
  country?: string | null;
  status: string;
  quote_id: string | null;
  quote_status: string | null;
  total_price?: string | null;
  currency?: string | null;
  stripe_payment_link?: string | null;
  paid_at?: string | null;
  shipment_status: string | null;
  order_number: string | null;
  created_at: string;
};

type Message = {
  id: string;
  quote_request_id: string;
  from_admin: boolean;
  content: string;
  read_at: string | null;
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
  /** IDs of *additional* requests bundled with `selected` into one combined
   *  quote. All must share `selected.user_id`. The primary `selected` request
   *  is NOT in this array — it's tracked separately so toggling other items
   *  doesn't lose the open form. */
  const [combinedIds, setCombinedIds] = useState<string[]>([]);
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
    setCombinedIds([]); // changing primary always clears the bundle
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

  /** Build a multi-line product name + notes summary covering the primary
   *  request and every bundled request. Called from the "Prefill description"
   *  button on the combined-quote banner. */
  function prefillCombinedQuote() {
    if (!selected || combinedIds.length === 0) return;
    const all = [selected, ...requests.filter((r) => combinedIds.includes(r.id))];

    const lines = all.map((r) => {
      const qty = r.quantity ? `${r.quantity}× ` : "";
      const label = r.product_description || r.product_link || "Item";
      return `${qty}${label}`;
    });
    const links = all
      .map((r) => r.product_link)
      .filter((l): l is string => Boolean(l));

    setQuote((prev) => ({
      ...prev,
      product_name: `${all.length} items: ${all.map((r) => (r.product_description || r.product_link || "item").slice(0, 40)).join(" + ")}`.slice(0, 500),
      product_link: links[0] || prev.product_link,
      notes: lines.join("\n") + (links.length > 1 ? `\n\nAll links:\n${links.join("\n")}` : ""),
    }));
    setNotice(`Prefilled with ${all.length} items.`);
  }

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
      const allRequestIds = [selected.id, ...combinedIds];
      const payload: any = {
        ...quote,
        quote_request_id: selected.id,
        // When combining, every listed request gets linked to the new quote
        // so the customer sees a single Pay-now button covering the bundle.
        quote_request_ids: allRequestIds,
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
          {requests.map((request) => {
            const isPrimary = selected?.id === request.id;
            const isCombined = combinedIds.includes(request.id);
            const sameCustomer = !!selected && selected.user_id === request.user_id;
            const canBundle = !!selected && !isPrimary && sameCustomer;
            return (
            <div
              key={request.id}
              className={`relative transition-colors ${isPrimary ? "bg-[#ff5500]/10" : isCombined ? "bg-[#ff5500]/5 ring-1 ring-inset ring-[#ff5500]/30" : "hover:bg-white/[0.03]"}`}
            >
              {/* Bundle checkbox — only enabled when a primary is open and the
                  row belongs to the same customer. Clicking the checkbox does
                  NOT open the row as primary. */}
              {canBundle && (
                <button
                  type="button"
                  title={isCombined ? "Remove from bundle" : "Add to combined quote"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCombinedIds((prev) =>
                      prev.includes(request.id)
                        ? prev.filter((id) => id !== request.id)
                        : [...prev, request.id]
                    );
                  }}
                  className={`absolute top-3 right-3 z-10 flex items-center justify-center w-6 h-6 rounded-md border transition-all ${
                    isCombined
                      ? "bg-[#ff5500] border-[#ff5500] text-black"
                      : "bg-black/40 border-white/20 text-white/40 hover:border-[#ff5500] hover:text-[#ff5500]"
                  }`}
                >
                  {isCombined ? <i className="text-xs">✓</i> : <i className="text-xs">+</i>}
                </button>
              )}
            <button
              onClick={() => openRequest(request)}
              className="w-full text-left p-5 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5500]"
            >
              <div className="flex items-center justify-between gap-3 pr-8">
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
            </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {notice && <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm font-bold text-green-300">{notice}</div>}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-300">{error}</div>}

        {selected ? (
          <>
            {combinedIds.length > 0 && (
              <section className="rounded-2xl border border-[#ff5500]/30 bg-[#ff5500]/10 px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#ff5500]">Combined quote</div>
                  <div className="text-sm text-white">
                    {combinedIds.length + 1} requests bundled — one quote, one Pay-now link for {selected.customer_email}.
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => prefillCombinedQuote()}
                    className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2 text-xs font-black uppercase"
                  >
                    Prefill description
                  </button>
                  <button
                    type="button"
                    onClick={() => setCombinedIds([])}
                    className="rounded-xl bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-black uppercase text-white/70"
                  >
                    Clear bundle
                  </button>
                </div>
              </section>
            )}
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
                <Info label="Customer" value={[selected.customer_first_name, selected.customer_last_name].filter(Boolean).join(" ") || "—"} />
                <Info label="Phone" value={selected.contact_phone || selected.customer_phone || "—"} />
                <Info label="Quantity" value={selected.quantity ? String(selected.quantity) : "—"} />
                <Info label="Category" value={selected.category || "—"} />
                <Info label="Product link" value={selected.product_link || "None"} />
                <Info label="Selected items" value={selectedSummary} />
                <Info label="Description" value={selected.product_description || "None"} wide />
                <Info label="Delivery address" value={[selected.street, selected.zip_code, selected.city, selected.country].filter(Boolean).join(", ") || "—"} wide />
                {selected.paid_at ? (
                  <Info label="Payment" value={`PAID • ${new Date(selected.paid_at).toLocaleString()}`} wide />
                ) : selected.stripe_payment_link ? (
                  <Info label="Payment" value={`Awaiting payment — ${selected.stripe_payment_link.slice(0, 60)}…`} wide />
                ) : null}
              </div>
            </section>

            <MessagesPanel requestId={selected.id} />

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
                <ImageUploadField
                  value={quote.product_image_url}
                  onChange={(value) => setQuoteField("product_image_url", value)}
                  onError={setError}
                />
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
                  <select value={quote.status} onChange={(e) => setQuoteField("status", e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#ff5500]">
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
                  <select value={shipment.status} onChange={(e) => setShipment((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#ff5500]">
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
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#ff5500]"
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
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#ff5500]"
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

function MessagesPanel({ requestId }: { requestId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiJson<{ messages: Message[] }>(`/api/admin/quote-requests/${encodeURIComponent(requestId)}/messages`)
      .then((data) => {
        if (!cancelled) setMessages(data.messages || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load messages");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  async function send() {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");
    try {
      await apiJson(`/api/admin/quote-requests/${encodeURIComponent(requestId)}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      const data = await apiJson<{ messages: Message[] }>(
        `/api/admin/quote-requests/${encodeURIComponent(requestId)}/messages`
      );
      setMessages(data.messages || []);
      setDraft("");
    } catch (e: any) {
      setError(e?.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="glass-panel border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase italic">Messages</h2>
          <p className="text-sm text-[#94a3b8]">Two-way thread with the customer. They get a notification on send.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">{error}</div>}

      <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <div className="text-sm text-[#94a3b8]">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-[#94a3b8] italic">No messages yet.</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                m.from_admin ? "ml-auto bg-[#ff5500]/15 border border-[#ff5500]/20" : "bg-white/[0.04] border border-white/10"
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-widest mb-1 text-[#94a3b8]">
                {m.from_admin ? "Admin" : "Customer"} • {new Date(m.created_at).toLocaleString()}
              </div>
              <div className="text-sm text-white whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Reply to the customer…"
          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#ff5500]"
        />
        <div className="flex justify-end">
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#ff5500] px-5 py-3 text-xs font-black uppercase text-black hover:scale-[1.01] disabled:opacity-50"
          >
            <Send size={16} /> {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ImageUploadField({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (value: string) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement | null>(null);

  async function uploadBlob(blob: Blob) {
    if (!blob.type.startsWith("image/")) {
      onError("Only images can be uploaded.");
      return;
    }
    if (blob.size > 10 * 1024 * 1024) {
      onError("Image is larger than 10 MB.");
      return;
    }
    setBusy(true);
    onError("");
    try {
      const fd = new FormData();
      fd.append("file", blob, (blob as any).name || "pasted-image");
      const res = await fetch("/api/admin/upload/quote-image", {
        method: "POST",
        body: fd,
        headers: {
          "x-csrf-token": getCsrfToken(),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      onChange(data.url);
    } catch (e: any) {
      onError(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPaste(ev: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(ev.clipboardData.items || []).find((i) =>
      i.kind === "file" && i.type.startsWith("image/")
    );
    if (!item) return;
    ev.preventDefault();
    const blob = item.getAsFile();
    if (blob) await uploadBlob(blob);
  }

  async function onDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    setDragOver(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) await uploadBlob(file);
  }

  async function onFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (file) await uploadBlob(file);
    ev.target.value = "";
  }

  return (
    <label className="space-y-2 col-span-2">
      <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">
        Product image (paste, drop or pick a file)
      </span>
      <div
        tabIndex={0}
        onPaste={onPaste}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed px-4 py-5 transition-colors cursor-pointer outline-none focus-visible:border-[#ff5500] ${
          dragOver ? "border-[#ff5500] bg-[#ff5500]/5" : "border-white/15 bg-black/20 hover:border-white/30"
        }`}
        onClick={() => fileInput.current?.click()}
      >
        {busy ? (
          <div className="text-sm text-[#94a3b8]">Uploading…</div>
        ) : value ? (
          <div className="flex items-start gap-4">
            <img
              src={value}
              alt="Product"
              className="w-24 h-24 object-cover rounded-lg border border-white/10"
            />
            <div className="flex-1 space-y-1 min-w-0">
              <div className="text-xs text-white/60 break-all">{value}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(""); }}
                  className="text-xs font-bold uppercase text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
                <span className="text-xs text-white/40">• click area to replace</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#94a3b8] space-y-1">
            <div className="font-bold text-white">Paste an image here (Ctrl+V), drop a file, or click to pick.</div>
            <div className="text-xs">JPEG, PNG, WebP, GIF, AVIF — up to 10 MB. Stored on Cargoo R2.</div>
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
      {/* Power-user escape hatch: paste a URL directly. */}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste a URL"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#ff5500]"
      />
    </label>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  balance: number | null;
  status: string | null;
};

type Sale = {
  id: string;
  total_amount: number | null;
  payment_status: string | null;
  created_at: string;
};

type Payment = {
  id: string;
  amount: number | null;
  payment_type: string | null;
  note: string | null;
  created_at: string;
};

export default function OdemelerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedSale, setSelectedSale] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("Nakit");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("id, name, balance, status")
      .order("name", { ascending: true });

    setCustomers((data as Customer[]) || []);
  };

  const loadSales = async (customerId: string) => {
    if (!customerId) {
      setSales([]);
      return;
    }

    const { data } = await supabase
      .from("sales")
      .select("id, total_amount, payment_status, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    setSales((data as Sale[]) || []);
  };

  const loadPayments = async (saleId: string) => {
    if (!saleId) {
      setPayments([]);
      return;
    }

    const { data } = await supabase
      .from("payments")
      .select("id, amount, payment_type, note, created_at")
      .eq("sale_id", saleId)
      .order("created_at", { ascending: false });

    setPayments((data as Payment[]) || []);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadSales(selectedCustomer);
    setSelectedSale("");
    setPayments([]);
  }, [selectedCustomer]);

  useEffect(() => {
    loadPayments(selectedSale);
  }, [selectedSale]);

  const selectedCustomerData = customers.find((c) => c.id === selectedCustomer);
  const selectedSaleData = sales.find((s) => s.id === selectedSale);

  const paidForSelectedSale = useMemo(() => {
    return payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments]);

  const selectedSaleTotal = Number(selectedSaleData?.total_amount || 0);
  const remainingForSelectedSale = Math.max(selectedSaleTotal - paidForSelectedSale, 0);

  const remainingCustomerBalance = Number(selectedCustomerData?.balance || 0);

  const handlePayment = async () => {
    setMessage("");

    if (!selectedCustomer) {
      setMessage("Musteri sec");
      return;
    }

    if (!selectedSale) {
      setMessage("Satis sec");
      return;
    }

    const amountNumber = parseFloat(amount.replace(",", "."));

    if (isNaN(amountNumber) || amountNumber <= 0) {
      setMessage("Gecerli odeme gir");
      return;
    }

    if (amountNumber > remainingForSelectedSale) {
      setMessage("Odeme tutari kalan borctan buyuk olamaz");
      return;
    }

    try {
      setLoading(true);

      const { error: paymentError } = await supabase.from("payments").insert([
        {
          customer_id: selectedCustomer,
          sale_id: selectedSale,
          amount: amountNumber,
          payment_type: paymentType,
          note: note.trim() || null,
        },
      ]);

      if (paymentError) {
        setMessage("Odeme kaydedilemedi");
        return;
      }

      const currentCustomerBalance = Number(selectedCustomerData?.balance || 0);
      const newCustomerBalance = Math.max(currentCustomerBalance - amountNumber, 0);

      const customerStatus = newCustomerBalance > 0 ? "Borclu" : "Temiz";

      const { error: customerError } = await supabase
        .from("customers")
        .update({
          balance: newCustomerBalance,
          status: customerStatus,
        })
        .eq("id", selectedCustomer);

      if (customerError) {
        setMessage("Musteri bakiyesi guncellenemedi");
        return;
      }

      const newPaidTotal = paidForSelectedSale + amountNumber;
      const saleStatus =
        newPaidTotal >= selectedSaleTotal ? "Odendi" : "Bekliyor";

      const { error: saleError } = await supabase
        .from("sales")
        .update({
          payment_status: saleStatus,
        })
        .eq("id", selectedSale);

      if (saleError) {
        setMessage("Satis durumu guncellenemedi");
        return;
      }

      setAmount("");
      setNote("");
      setMessage("Odeme basariyla kaydedildi");

      await loadCustomers();
      await loadSales(selectedCustomer);
      await loadPayments(selectedSale);
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 border-x border-zinc-900 flex flex-col">
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Tahsilat yonetimi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Odemeler
              </h1>
              <p className="text-zinc-300 mt-1">Satis bazli veresiye takibi</p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              ₺
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="">Musteri sec</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSale}
              onChange={(e) => setSelectedSale(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="">Satis sec</option>
              {sales.map((sale) => (
                <option key={sale.id} value={sale.id}>
                  {new Date(sale.created_at).toLocaleString("tr-TR")} -{" "}
                  {Number(sale.total_amount || 0).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  TL - {sale.payment_status || "Bekliyor"}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Odeme tutari"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="Nakit">Nakit</option>
              <option value="Kart">Kart</option>
              <option value="Havale">Havale</option>
            </select>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Not"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full rounded-2xl bg-white text-black p-4 font-semibold disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : "Odemeyi Kaydet"}
            </button>

            {message && (
              <div className="rounded-2xl bg-zinc-800 border border-zinc-700 p-3 text-sm">
                {message}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Musteri Bakiyesi</p>
              <h2 className="text-2xl font-bold mt-2 text-red-400">
                {remainingCustomerBalance.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Secili Satis Kalan</p>
              <h2 className="text-2xl font-bold mt-2 text-green-400">
                {remainingForSelectedSale.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-sm text-zinc-400 mb-3">Odeme Gecmisi</p>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-zinc-500">Secili satis icin odeme yok</p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl bg-zinc-800 border border-zinc-700 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {Number(payment.amount || 0).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          TL
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {payment.payment_type || "-"}
                        </p>
                      </div>

                      <p className="text-xs text-zinc-500">
                        {new Date(payment.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>

                    {payment.note && (
                      <p className="text-sm text-zinc-300 mt-2">{payment.note}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold">{customer.name}</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    {Number(customer.balance || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    TL bakiye
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    customer.status === "Borclu"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {customer.status || "Temiz"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
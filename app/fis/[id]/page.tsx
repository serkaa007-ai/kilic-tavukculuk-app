"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SaleItem = {
  product_name: string | null;
  quantity: number | null;
  unit_price: number | null;
  total_price: number | null;
};

type Payment = {
  id: string;
  amount: number | null;
  created_at: string;
};

type Sale = {
  id: string;
  total_amount: number | null;
  payment_status: string | null;
  created_at: string;
  customers: {
    name: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  sale_items: SaleItem[];
};

export default function FisDetayPage() {
  const params = useParams();
  const id = params?.id as string;

  const [sale, setSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSale = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setMessage("");

        const { data: saleData, error: saleError } = await supabase
          .from("sales")
          .select(`
            id,
            total_amount,
            payment_status,
            created_at,
            customers (
              name,
              phone,
              address
            ),
            sale_items (
              product_name,
              quantity,
              unit_price,
              total_price
            )
          `)
          .eq("id", id)
          .single();

        if (saleError) {
          console.error("Satış çekilemedi:", saleError);
          setMessage(`Satış bilgisi alınamadı: ${saleError.message}`);
          setSale(null);
          setPayments([]);
          return;
        }

        setSale((saleData as unknown as Sale) ?? null);

        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("id, amount, created_at")
          .eq("sale_id", id)
          .order("created_at", { ascending: true });

        if (paymentError) {
          console.error("Ödemeler çekilemedi:", paymentError);
          setMessage(`Ödeme bilgisi alınamadı: ${paymentError.message}`);
          setPayments([]);
          return;
        }

        setPayments((paymentData as Payment[]) || []);
      } catch (err) {
        console.error("Fiş detay yükleme hatası:", err);
        setMessage("Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id]);

  const formatMoney = (value: number) => {
    return Number(value || 0).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const totalPaid = useMemo(() => {
    return payments.reduce((sum, payment) => {
      return sum + Number(payment.amount || 0);
    }, 0);
  }, [payments]);

  const totalAmount = Number(sale?.total_amount || 0);
  const remainingAmount = Math.max(totalAmount - totalPaid, 0);

  const normalizePhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = "90" + cleaned.slice(1);
    }

    if (!cleaned.startsWith("90")) {
      cleaned = "90" + cleaned;
    }

    return cleaned;
  };

  const buildWhatsappReceiptText = () => {
    if (!sale) return "";

    const customerName = sale.customers?.name || "-";
    const customerPhone = sale.customers?.phone || "-";
    const customerAddress = sale.customers?.address || "-";
    const saleDate = new Date(sale.created_at).toLocaleString("tr-TR");

    const itemsText =
      sale.sale_items?.length > 0
        ? sale.sale_items
            .map((item, index) => {
              const productName = item.product_name || "-";
              const quantity = Number(item.quantity || 0).toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const unitPrice = formatMoney(Number(item.unit_price || 0));
              const totalPrice = formatMoney(Number(item.total_price || 0));

              return `${index + 1}. ${productName}
Miktar: ${quantity} kg
Birim Fiyat: ${unitPrice} TL
Tutar: ${totalPrice} TL`;
            })
            .join("\n\n")
        : "Ürün bilgisi bulunamadı";

    return `KILIÇ TAVUKÇULUK
Satış Fişi

Müşteri: ${customerName}
Telefon: ${customerPhone}
Adres: ${customerAddress}
Tarih: ${saleDate}
Ödeme Durumu: ${sale.payment_status || "-"}

Ürünler:
${itemsText}

Genel Toplam: ${formatMoney(totalAmount)} TL
Ödenen Tutar: ${formatMoney(totalPaid)} TL
Kalan Borç: ${formatMoney(remainingAmount)} TL

Teşekkür ederiz.`;
  };

  const handleSendWhatsapp = () => {
    if (!sale) {
      setMessage("Fiş bilgisi bulunamadı");
      return;
    }

    const rawPhone = sale.customers?.phone || "";

    if (!rawPhone.trim()) {
      setMessage("Müşterinin telefon numarası kayıtlı değil");
      return;
    }

    const phone = normalizePhoneNumber(rawPhone);
    const text = buildWhatsappReceiptText();
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black p-6">
        <p>Yükleniyor...</p>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="min-h-screen bg-white text-black p-6">
        <p>Fiş bulunamadı.</p>
        {message && <p className="mt-2 text-red-600">{message}</p>}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-black p-4 print:bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap justify-between gap-2 mb-4 print:hidden">
          <Link
            href="/gecmis-fisler"
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl font-semibold"
          >
            Geri Dön
          </Link>

          <div className="flex gap-2">
            <button
              onClick={handleSendWhatsapp}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold"
            >
              WhatsApp Gönder
            </button>

            <button
              onClick={() => window.print()}
              className="bg-black text-white px-4 py-2 rounded-xl font-semibold"
            >
              Yazdır / PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 print:shadow-none print:rounded-none">
          <div className="text-center border-b pb-4">
            <div className="flex justify-center mb-3">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white border border-zinc-200 flex items-center justify-center">
                <Image
                  src="/kilic-logo.png"
                  alt="Kılıç Tavukçuluk Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold">Kılıç Tavukçuluk</h1>
            <p className="text-sm text-zinc-500 mt-1">Satış Fişi</p>
            <p className="text-sm text-zinc-500 mt-1">0507 895 72 70</p>
          </div>

          {message && (
            <div className="mt-4 rounded-xl border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 print:hidden">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-zinc-500">Müşteri</p>
              <p className="font-semibold">{sale.customers?.name || "-"}</p>
            </div>

            <div>
              <p className="text-zinc-500">Tarih</p>
              <p className="font-semibold">
                {new Date(sale.created_at).toLocaleString("tr-TR")}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">Telefon</p>
              <p className="font-semibold">{sale.customers?.phone || "-"}</p>
            </div>

            <div>
              <p className="text-zinc-500">Ödeme Durumu</p>
              <p className="font-semibold">{sale.payment_status || "-"}</p>
            </div>

            <div className="col-span-2">
              <p className="text-zinc-500">Adres</p>
              <p className="font-semibold">{sale.customers?.address || "-"}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="text-left p-3">Ürün</th>
                  <th className="text-right p-3">Miktar</th>
                  <th className="text-right p-3">Fiyat</th>
                  <th className="text-right p-3">Tutar</th>
                </tr>
              </thead>
              <tbody>
                {sale.sale_items?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.product_name || "-"}</td>
                    <td className="p-3 text-right">
                      {Number(item.quantity || 0).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      kg
                    </td>
                    <td className="p-3 text-right">
                      {formatMoney(Number(item.unit_price || 0))} TL
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatMoney(Number(item.total_price || 0))} TL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Genel Toplam</span>
                <span className="font-semibold">
                  {formatMoney(totalAmount)} TL
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">Ödenen Tutar</span>
                <span className="font-semibold text-green-600">
                  {formatMoney(totalPaid)} TL
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
                <span>Kalan Borç</span>
                <span className={remainingAmount > 0 ? "text-red-600" : "text-green-600"}>
                  {formatMoney(remainingAmount)} TL
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-base font-bold mb-3">Ödeme Geçmişi</h2>

            {payments.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">
                Bu satış için kayıtlı ödeme bulunmuyor.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-100">
                    <tr>
                      <th className="text-left p-3">Tarih</th>
                      <th className="text-right p-3">Ödenen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-t">
                        <td className="p-3">
                          {new Date(payment.created_at).toLocaleString("tr-TR")}
                        </td>
                        <td className="p-3 text-right font-semibold text-green-600">
                          {formatMoney(Number(payment.amount || 0))} TL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-10 text-center text-xs text-zinc-500">
            <p>Kılıç Tavukçuluk</p>
            <p>0507 895 72 70</p>
            <p>Bu belge sistem tarafından oluşturulmuştur.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
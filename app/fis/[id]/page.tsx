"use client";

import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSale = async () => {
      if (!id) return;

      const { data } = await supabase
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

      setSale((data as unknown as Sale) ?? null);
      setLoading(false);
    };

    loadSale();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black p-6">
        <p>Yukleniyor...</p>
      </main>
    );
  }

  if (!sale) {
    return (
      <main className="min-h-screen bg-white text-black p-6">
        <p>Fis bulunamadi.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-black p-4 print:bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between mb-4 print:hidden">
          <Link
            href="/gecmis-fisler"
            className="bg-zinc-800 text-white px-4 py-2 rounded-xl font-semibold"
          >
            Geri Don
          </Link>

          <button
            onClick={() => window.print()}
            className="bg-black text-white px-4 py-2 rounded-xl font-semibold"
          >
            Yazdir / PDF
          </button>
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
            <p className="text-sm text-zinc-500 mt-1">Satis Fisi</p>
            <p className="text-sm text-zinc-500 mt-1">0507 895 72 70</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-zinc-500">Musteri</p>
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
              <p className="text-zinc-500">Odeme Durumu</p>
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
                  <th className="text-left p-3">Urun</th>
                  <th className="text-right p-3">KG</th>
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
                      })}
                    </td>
                    <td className="p-3 text-right">
                      {Number(item.unit_price || 0).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      TL
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {Number(item.total_price || 0).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      TL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex items-center justify-between border-t pt-3 text-lg font-bold">
                <span>Genel Toplam</span>
                <span>
                  {Number(sale.total_amount || 0).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  TL
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center text-xs text-zinc-500">
            <p>Kılıç Tavukçuluk</p>
            <p>0507 895 72 70</p>
            <p>Bu belge sistem tarafindan olusturulmustur.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
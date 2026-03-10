"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Sale = {
  id: string;
  total_amount: number | null;
  payment_status: string | null;
  created_at: string;
};

export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const { data: salesData } = await supabase
      .from("sales")
      .select("id, total_amount, payment_status, created_at")
      .order("created_at", { ascending: false });

    const { count: customersCountData } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    const { count: productsCountData } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    setSales((salesData as Sale[]) || []);
    setCustomerCount(customersCountData || 0);
    setProductCount(productsCountData || 0);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const totalSales =
    sales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0;

  const pendingPayments =
    sales
      .filter((sale) => sale.payment_status === "Bekliyor")
      .reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0) || 0;

  const paidSales = totalSales - pendingPayments;
  const receiptCount = sales.length || 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 border-x border-zinc-900 flex flex-col">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white/5 border border-zinc-800 flex items-center justify-center">
                <Image
                  src="/kilic-logo.png"
                  alt="Kılıç Tavukçuluk Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>

              <div>
                <p className="text-zinc-400 text-sm">Hos geldin</p>
                <h1 className="text-3xl font-bold tracking-tight text-red-500">
                  Kılıç Tavukçuluk
                </h1>
                <p className="text-zinc-300 mt-1">Satis Takip Sistemi</p>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            {loading ? "Veriler yukleniyor..." : "Otomatik guncelleniyor"}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Toplam Satis</p>
              <h2 className="text-2xl font-bold mt-2">
                {totalSales.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Kesilen Fis</p>
              <h2 className="text-2xl font-bold mt-2">{receiptCount}</h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Tahsilat</p>
              <h2 className="text-2xl font-bold mt-2 text-green-400">
                {paidSales.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Veresiye</p>
              <h2 className="text-2xl font-bold mt-2 text-red-400">
                {pendingPayments.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>
          </div>

          <Link
            href="/yeni-satis"
            className="block w-full mt-6 rounded-3xl bg-red-600 hover:bg-red-700 transition p-4 text-center text-lg font-semibold shadow-lg shadow-red-950/40"
          >
            + Yeni Satis
          </Link>

          <div className="mt-6">
            <h3 className="text-sm text-zinc-400 mb-3">Hizli Erisim</h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/musteriler"
                className="rounded-3xl bg-white text-black p-4 font-semibold text-center"
              >
                Musteriler
              </Link>

              <Link
                href="/urunler"
                className="rounded-3xl bg-white text-black p-4 font-semibold text-center"
              >
                Urunler
              </Link>

              <Link
                href="/gecmis-fisler"
                className="rounded-3xl bg-white text-black p-4 font-semibold text-center"
              >
                Gecmis Fisler
              </Link>

              <Link
                href="/raporlar"
                className="rounded-3xl bg-white text-black p-4 font-semibold text-center"
              >
                Raporlar
              </Link>

              <Link
                href="/odemeler"
                className="rounded-3xl bg-white text-black p-4 font-semibold text-center"
              >
                Odemeler
              </Link>

              <Link
                href="/ayarlar"
                className="rounded-3xl bg-white text-black p-4 font-semibold text-center"
              >
                Ayarlar
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-sm text-zinc-400">Bugunun Ozeti</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Toplam musteri</span>
                <span className="font-semibold">{customerCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Toplam urun</span>
                <span className="font-semibold">{productCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Bekleyen odeme</span>
                <span className="font-semibold text-red-400">
                  {pendingPayments.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  TL
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto sticky bottom-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800">
          <div className="grid grid-cols-4 text-center text-xs">
            <Link href="/" className="py-4 text-red-500 font-semibold">
              Ana Sayfa
            </Link>
            <Link href="/gecmis-fisler" className="py-4 text-zinc-400">
              Fisler
            </Link>
            <Link href="/musteriler" className="py-4 text-zinc-400">
              Musteriler
            </Link>
            <Link href="/raporlar" className="py-4 text-zinc-400">
              Raporlar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
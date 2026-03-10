"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AyarlarPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetText, setResetText] = useState("");

  const handleDeleteSales = async () => {
    const ok = window.confirm("Tum satislar ve fis kalemleri silinsin mi?");
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: paymentsError } = await supabase
        .from("payments")
        .delete()
        .not("id", "is", null);

      if (paymentsError) {
        setMessage("Odemeler silinemedi: " + paymentsError.message);
        return;
      }

      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .delete()
        .not("id", "is", null);

      if (saleItemsError) {
        setMessage("Satis kalemleri silinemedi: " + saleItemsError.message);
        return;
      }

      const { error: salesError } = await supabase
        .from("sales")
        .delete()
        .not("id", "is", null);

      if (salesError) {
        setMessage("Satislar silinemedi: " + salesError.message);
        return;
      }

      setMessage("Satislar ve odemeler temizlendi");

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayments = async () => {
    const ok = window.confirm("Tum odemeler silinsin mi?");
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: paymentsError } = await supabase
        .from("payments")
        .delete()
        .not("id", "is", null);

      if (paymentsError) {
        setMessage("Odemeler silinemedi: " + paymentsError.message);
        return;
      }

      setMessage("Odeme kayitlari temizlendi");
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoProducts = async () => {
    const ok = window.confirm(
      "Demo urun listesi yuklensin mi? Mevcut urunler silinir."
    );
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: deleteProductsError } = await supabase
        .from("products")
        .delete()
        .not("id", "is", null);

      if (deleteProductsError) {
        setMessage("Mevcut urunler silinemedi: " + deleteProductsError.message);
        return;
      }

      const demoProducts = [
        { name: "Posetli pilic", price: 0, unit: "kg", active: true },
        { name: "Acik pilic", price: 0, unit: "kg", active: true },
        { name: "Acik 1500", price: 0, unit: "kg", active: true },
        { name: "Acik 1300-1400", price: 0, unit: "kg", active: true },
        { name: "Dokme Ciger", price: 0, unit: "kg", active: true },
        { name: "Dokme Taslik", price: 0, unit: "kg", active: true },
        { name: "Catal but", price: 0, unit: "kg", active: true },
        { name: "Spesiel but", price: 0, unit: "kg", active: true },
        { name: "Sarma", price: 0, unit: "kg", active: true },
        { name: "Baget", price: 0, unit: "kg", active: true },
        { name: "Kemiksiz but", price: 0, unit: "kg", active: true },
        { name: "Izgara tava", price: 0, unit: "kg", active: true },
        { name: "Derili bonfile", price: 0, unit: "kg", active: true },
        { name: "Derisiz bonfile", price: 0, unit: "kg", active: true },
        { name: "Muz gogus", price: 0, unit: "kg", active: true },
        { name: "Tum gogus", price: 0, unit: "kg", active: true },
        { name: "Kelebek", price: 0, unit: "kg", active: true },
        { name: "Tum kanat", price: 0, unit: "kg", active: true },
        { name: "Izgara kanat", price: 0, unit: "kg", active: true },
        { name: "Yaprak kanat", price: 0, unit: "kg", active: true },
        { name: "Ucsuz kanat", price: 0, unit: "kg", active: true },
        { name: "Kafes", price: 0, unit: "kg", active: true },
        { name: "Incik", price: 0, unit: "kg", active: true },
        { name: "Parmak Bonfile", price: 0, unit: "kg", active: true },
        { name: "Savurma", price: 0, unit: "kg", active: true },
      ];

      const { error: insertProductsError } = await supabase
        .from("products")
        .insert(demoProducts);

      if (insertProductsError) {
        setMessage("Demo urunleri yuklenemedi: " + insertProductsError.message);
        return;
      }

      setMessage("Demo urun listesi yuklendi");
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const handleFullReset = async () => {
    if (resetText !== "SIFIRLA") {
      setMessage('Tam sifirlama icin kutuya "SIFIRLA" yaz');
      return;
    }

    const ok = window.confirm(
      "Musteriler, satislar ve odemeler silinsin mi? Urun isimleri ve urun listesi korunacak."
    );
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const { error: paymentsError } = await supabase
        .from("payments")
        .delete()
        .not("id", "is", null);
      if (paymentsError) {
        setMessage("Odemeler silinemedi: " + paymentsError.message);
        return;
      }

      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .delete()
        .not("id", "is", null);
      if (saleItemsError) {
        setMessage("Satis kalemleri silinemedi: " + saleItemsError.message);
        return;
      }

      const { error: salesError } = await supabase
        .from("sales")
        .delete()
        .not("id", "is", null);
      if (salesError) {
        setMessage("Satislar silinemedi: " + salesError.message);
        return;
      }

      const { error: customersError } = await supabase
        .from("customers")
        .delete()
        .not("id", "is", null);
      if (customersError) {
        setMessage("Musteriler silinemedi: " + customersError.message);
        return;
      }

      setResetText("");
      setMessage(
        "Musteriler, satislar ve odemeler temizlendi. Urun listesi korundu."
      );

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 border-x border-zinc-900">
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Sistem yonetimi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Ayarlar
              </h1>
              <p className="text-zinc-300 mt-1">
                Veri temizleme ve demo yukleme
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              A
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <h2 className="text-lg font-semibold mb-3">Veri Temizleme</h2>

              <div className="space-y-3">
                <button
                  onClick={handleDeleteSales}
                  disabled={loading}
                  className="w-full rounded-2xl bg-white text-black p-4 font-semibold disabled:opacity-60"
                >
                  Satislari Temizle
                </button>

                <button
                  onClick={handleDeletePayments}
                  disabled={loading}
                  className="w-full rounded-2xl bg-white text-black p-4 font-semibold disabled:opacity-60"
                >
                  Odemeleri Temizle
                </button>

                <button
                  onClick={handleLoadDemoProducts}
                  disabled={loading}
                  className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 font-semibold disabled:opacity-60"
                >
                  Demo Urunleri Yukle
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-red-900 p-4">
              <h2 className="text-lg font-semibold text-red-400 mb-3">
                Tum Sistemi Sifirla
              </h2>

              <p className="text-sm text-zinc-400 mb-3">
                Musteriler, satislar ve odemeler silinir. Urun listesi korunur.
              </p>

              <input
                type="text"
                value={resetText}
                onChange={(e) => setResetText(e.target.value)}
                placeholder='Onay icin SIFIRLA yaz'
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />

              <button
                onClick={handleFullReset}
                disabled={loading}
                className="w-full mt-3 rounded-2xl bg-red-600 p-4 font-semibold disabled:opacity-60"
              >
                Tum Sistemi Sifirla
              </button>
            </div>

            {message && (
              <div className="rounded-2xl bg-zinc-800 border border-zinc-700 p-3 text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  balance?: number | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number | null;
};

export default function YeniSatisPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [kg, setKg] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    const { data: customerData } = await supabase
      .from("customers")
      .select("id, name, balance")
      .order("name", { ascending: true });

    const { data: productData } = await supabase
      .from("products")
      .select("id, name, price, unit, stock")
      .eq("active", true)
      .order("name", { ascending: true });

    setCustomers((customerData as Customer[]) || []);
    setProducts((productData as Product[]) || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedProductId) return;

    const selected = products.find((p) => p.id === selectedProductId);
    if (selected) {
      setPrice(String(selected.price));
    }
  }, [selectedProductId, products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const kgNumber = useMemo(() => {
    const value = parseFloat(kg.replace(",", "."));
    return isNaN(value) ? 0 : value;
  }, [kg]);

  const priceNumber = useMemo(() => {
    const value = parseFloat(price.replace(",", "."));
    return isNaN(value) ? 0 : value;
  }, [price]);

  const total = useMemo(() => {
    if (isNaN(kgNumber) || isNaN(priceNumber)) return 0;
    return kgNumber * priceNumber;
  }, [kgNumber, priceNumber]);

  const currentStock = Number(selectedProduct?.stock || 0);
  const remainingStock = selectedProduct ? currentStock - kgNumber : 0;

  const handleSaveSale = async () => {
    setMessage("");

    if (!selectedCustomer) {
      setMessage("Musteri sec");
      return;
    }

    if (!selectedProductId) {
      setMessage("Urun sec");
      return;
    }

    if (isNaN(kgNumber) || kgNumber <= 0) {
      setMessage("Gecerli kg gir");
      return;
    }

    if (isNaN(priceNumber) || priceNumber <= 0) {
      setMessage("Gecerli fiyat gir");
      return;
    }

    if (!selectedProduct) {
      setMessage("Urun bulunamadi");
      return;
    }

    const liveStock = Number(selectedProduct.stock || 0);

    if (liveStock <= 0) {
      setMessage("Bu urunun stogu yok");
      return;
    }

    if (kgNumber > liveStock) {
      setMessage(`Yetersiz stok. Mevcut stok: ${liveStock.toLocaleString("tr-TR")} ${selectedProduct.unit}`);
      return;
    }

    try {
      setLoading(true);

      const { data: latestProduct, error: latestProductError } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", selectedProductId)
        .single();

      if (latestProductError || !latestProduct) {
        setMessage("Urun tekrar kontrol edilemedi");
        return;
      }

      const latestStock = Number(latestProduct.stock || 0);

      if (kgNumber > latestStock) {
        setMessage(`Yetersiz stok. Mevcut stok: ${latestStock.toLocaleString("tr-TR")} ${selectedProduct.unit}`);
        await loadData();
        return;
      }

      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([
          {
            customer_id: selectedCustomer,
            total_amount: total,
            payment_status: "Bekliyor",
          },
        ])
        .select()
        .single();

      if (saleError || !saleData) {
        setMessage("Satis kaydedilemedi");
        return;
      }

      const { error: itemError } = await supabase.from("sale_items").insert([
        {
          sale_id: saleData.id,
          product_id: selectedProductId,
          product_name: selectedProduct.name,
          quantity: kgNumber,
          unit_price: priceNumber,
          total_price: total,
        },
      ]);

      if (itemError) {
        setMessage("Satis kalemi kaydedilemedi");
        return;
      }

      const newStock = latestStock - kgNumber;

      const { error: stockUpdateError } = await supabase
        .from("products")
        .update({
          stock: newStock,
        })
        .eq("id", selectedProductId);

      if (stockUpdateError) {
        setMessage("Satis kaydedildi ama stok guncellenemedi");
        return;
      }

      const selectedCustomerData = customers.find(
        (c) => c.id === selectedCustomer
      );
      const currentBalance = Number(selectedCustomerData?.balance || 0);
      const newBalance = currentBalance + total;

      const { error: customerUpdateError } = await supabase
        .from("customers")
        .update({
          balance: newBalance,
          status: "Borclu",
        })
        .eq("id", selectedCustomer);

      if (customerUpdateError) {
        setMessage("Satis ve stok guncellendi ama bakiye guncellenemedi");
        await loadData();
        return;
      }

      setMessage("Satis basariyla kaydedildi ve stok dusuldu");

      setSelectedCustomer("");
      setSelectedProductId("");
      setKg("");
      setPrice("");

      await loadData();
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
              <p className="text-zinc-400 text-sm">Yeni islem</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Yeni Satis
              </h1>
              <p className="text-zinc-300 mt-1">Musteri, urun ve stok kontrolu</p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              +
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <label className="block text-sm text-zinc-400 mb-2">Musteri</label>
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
          </div>

          <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <label className="block text-sm text-zinc-400 mb-2">Urun</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="">Urun sec</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Stok: {Number(product.stock || 0).toLocaleString("tr-TR")} {product.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <label className="block text-sm text-zinc-400 mb-2">KG</label>
              <input
                type="text"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <label className="block text-sm text-zinc-400 mb-2">Fiyat</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />
            </div>
          </div>

          <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <label className="block text-sm text-zinc-400 mb-2">
              Secilen Urun
            </label>
            <input
              type="text"
              value={
                selectedProduct
                  ? `${selectedProduct.name} / ${selectedProduct.unit}`
                  : ""
              }
              readOnly
              placeholder="Urun secilmedi"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
                <p className="text-sm text-zinc-400">Mevcut stok</p>
                <h3 className="text-2xl font-bold text-yellow-400 mt-2">
                  {currentStock.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {selectedProduct.unit}
                </h3>
              </div>

              <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
                <p className="text-sm text-zinc-400">Satis sonrasi stok</p>
                <h3
                  className={`text-2xl font-bold mt-2 ${
                    remainingStock < 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {remainingStock.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {selectedProduct.unit}
                </h3>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 p-5">
            <p className="text-sm text-zinc-400">Genel Toplam</p>
            <h2 className="text-4xl font-bold text-green-400 mt-2">
              {total.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              TL
            </h2>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-sm">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleSaveSale}
              disabled={loading}
              className="rounded-3xl bg-red-600 hover:bg-red-700 transition p-4 text-base font-semibold shadow-lg shadow-red-950/40 disabled:opacity-60"
            >
              {loading ? "Kaydediliyor..." : "Fis Olustur"}
            </button>

            <button className="rounded-3xl bg-white text-black p-4 text-base font-semibold">
              Yazdir
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
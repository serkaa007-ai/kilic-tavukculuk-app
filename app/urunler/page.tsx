"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number | null;
  unit: string | null;
  active: boolean | null;
};

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("kg");
  const [editActive, setEditActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts((data as Product[]) || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async () => {
    setMessage("");

    if (!name.trim()) {
      setMessage("Urun adi gir");
      return;
    }

    const priceNumber = parseFloat(price.replace(",", "."));

    if (isNaN(priceNumber) || priceNumber < 0) {
      setMessage("Gecerli fiyat gir");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("products").insert([
        {
          name: name.trim(),
          price: priceNumber,
          unit: unit.trim() || "kg",
          active: true,
        },
      ]);

      if (error) {
        setMessage("Urun eklenemedi");
        return;
      }

      setName("");
      setPrice("");
      setUnit("kg");
      setMessage("Urun basariyla eklendi");
      await loadProducts();
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditName(product.name || "");
    setEditPrice(String(product.price ?? 0));
    setEditUnit(product.unit || "kg");
    setEditActive(Boolean(product.active));
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditUnit("kg");
    setEditActive(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingId) return;

    setMessage("");

    if (!editName.trim()) {
      setMessage("Urun adi gir");
      return;
    }

    const priceNumber = parseFloat(editPrice.replace(",", "."));

    if (isNaN(priceNumber) || priceNumber < 0) {
      setMessage("Gecerli fiyat gir");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("products")
        .update({
          name: editName.trim(),
          price: priceNumber,
          unit: editUnit,
          active: editActive,
        })
        .eq("id", editingId);

      if (error) {
        setMessage("Urun guncellenemedi");
        return;
      }

      setMessage("Urun basariyla guncellendi");
      cancelEdit();
      await loadProducts();
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const ok = window.confirm("Bu urun silinsin mi?");
    if (!ok) return;

    setMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) {
        setMessage("Urun silinemedi");
        return;
      }

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Urun silindi");
      await loadProducts();
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
              <p className="text-zinc-400 text-sm">Urun yonetimi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Urunler
              </h1>
              <p className="text-zinc-300 mt-1">Ekle, duzenle, sil</p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              U
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Yeni Urun Ekle</h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Urun adi"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Fiyat"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="kg">kg</option>
              <option value="adet">adet</option>
              <option value="koli">koli</option>
            </select>

            <button
              onClick={handleAddProduct}
              disabled={loading}
              className="w-full rounded-2xl bg-white text-black p-4 font-semibold disabled:opacity-60"
            >
              {loading ? "Isleniyor..." : "+ Yeni Urun Ekle"}
            </button>
          </div>

          {editingId && (
            <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <h2 className="text-lg font-semibold">Urun Duzenle</h2>

              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Urun adi"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />

              <input
                type="text"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Fiyat"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />

              <select
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              >
                <option value="kg">kg</option>
                <option value="adet">adet</option>
                <option value="koli">koli</option>
              </select>

              <select
                value={editActive ? "aktif" : "pasif"}
                onChange={(e) => setEditActive(e.target.value === "aktif")}
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              >
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleUpdateProduct}
                  disabled={loading}
                  className="rounded-2xl bg-red-600 p-4 font-semibold disabled:opacity-60"
                >
                  Guncelle
                </button>

                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="rounded-2xl bg-zinc-800 border border-zinc-700 p-4 font-semibold disabled:opacity-60"
                >
                  Vazgec
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className="mt-4 rounded-2xl bg-zinc-800 border border-zinc-700 p-3 text-sm">
              {message}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Toplam</p>
              <h2 className="text-xl font-bold mt-2">{products.length}</h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Aktif</p>
              <h2 className="text-xl font-bold mt-2 text-green-400">
                {products.filter((p) => p.active).length}
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Pasif</p>
              <h2 className="text-xl font-bold mt-2 text-red-400">
                {products.filter((p) => !p.active).length}
              </h2>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {Number(product.price || 0).toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      TL / {product.unit || "kg"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      product.active
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {product.active ? "Aktif" : "Pasif"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => startEdit(product)}
                    className="rounded-2xl bg-white text-black px-4 py-3 text-sm font-semibold"
                  >
                    Duzenle
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded-2xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm font-semibold"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
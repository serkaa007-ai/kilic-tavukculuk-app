"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: number | null;
  unit: string | null;
  stock: number | null;
  active: boolean | null;
};

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editUnit, setEditUnit] = useState("kg");
  const [editStock, setEditStock] = useState("");
  const [editActive, setEditActive] = useState(true);

  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Ürünler yüklenemedi:", error);
        setMessage(`Ürünler yüklenemedi: ${error.message}`);
        return;
      }

      setProducts((data as Product[]) || []);
    } catch (err) {
      console.error("loadProducts hata:", err);
      setMessage("Ürünler yüklenirken bir hata oluştu");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const formatNumber = (value: number) => {
    return Number(value || 0).toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleAddProduct = async () => {
    setMessage("");

    if (!name.trim()) {
      setMessage("Ürün adı gir");
      return;
    }

    const priceNumber = parseFloat(price.replace(",", "."));
    const stockNumber = parseFloat((stock || "0").replace(",", "."));

    if (isNaN(priceNumber) || priceNumber < 0) {
      setMessage("Geçerli fiyat gir");
      return;
    }

    if (isNaN(stockNumber) || stockNumber < 0) {
      setMessage("Geçerli stok gir");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("products").insert([
        {
          name: name.trim(),
          price: priceNumber,
          unit: unit.trim() || "kg",
          stock: stockNumber,
          active: true,
        },
      ]);

      if (error) {
        console.error("Ürün ekleme hatası:", error);
        setMessage(`Ürün eklenemedi: ${error.message}`);
        return;
      }

      setName("");
      setPrice("");
      setUnit("kg");
      setStock("");
      setMessage("Ürün başarıyla eklendi");
      await loadProducts();
    } catch (err) {
      console.error("handleAddProduct hata:", err);
      setMessage("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditName(product.name || "");
    setEditPrice(String(product.price ?? 0));
    setEditUnit(product.unit || "kg");
    setEditStock(String(product.stock ?? 0));
    setEditActive(Boolean(product.active));
    setOpenProductId(product.id);
    setMessage("");

    setTimeout(() => {
      const el = document.getElementById(`product-${product.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditUnit("kg");
    setEditStock("");
    setEditActive(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingId) return;

    setMessage("");

    if (!editName.trim()) {
      setMessage("Ürün adı gir");
      return;
    }

    const priceNumber = parseFloat(editPrice.replace(",", "."));
    const stockNumber = parseFloat(editStock.replace(",", "."));

    if (isNaN(priceNumber) || priceNumber < 0) {
      setMessage("Geçerli fiyat gir");
      return;
    }

    if (isNaN(stockNumber) || stockNumber < 0) {
      setMessage("Geçerli stok gir");
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
          stock: stockNumber,
          active: editActive,
        })
        .eq("id", editingId);

      if (error) {
        console.error("Ürün güncelleme hatası:", error);
        setMessage(`Ürün güncellenemedi: ${error.message}`);
        return;
      }

      setMessage("Ürün başarıyla güncellendi");
      const currentId = editingId;
      cancelEdit();
      await loadProducts();
      setOpenProductId(currentId);
    } catch (err) {
      console.error("handleUpdateProduct hata:", err);
      setMessage("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const ok = window.confirm("Bu ürün silinsin mi?");
    if (!ok) return;

    setMessage("");

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        console.error("Ürün silme hatası:", error);
        setMessage(`Ürün silinemedi: ${error.message}`);
        return;
      }

      console.log("Silinen ürün:", data);

      if (editingId === id) {
        cancelEdit();
      }

      if (openProductId === id) {
        setOpenProductId(null);
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage("Ürün silindi");
    } catch (err) {
      console.error("handleDeleteProduct hata:", err);
      setMessage("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id: string) => {
    setOpenProductId((prev) => (prev === id ? null : id));
  };

  const totalStock = products.reduce((sum, product) => {
    return sum + Number(product.stock || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 border-x border-zinc-900 flex flex-col">
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Ürün yönetimi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Ürünler
              </h1>
              <p className="text-zinc-300 mt-1">
                Ekle, düzenle, sil, stok takip et
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              U
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Yeni Ürün Ekle</h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ürün adı"
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

            <input
              type="text"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stok miktarı"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <button
              onClick={handleAddProduct}
              disabled={loading}
              className="w-full rounded-2xl bg-white text-black p-4 font-semibold disabled:opacity-60"
            >
              {loading ? "İşleniyor..." : "+ Yeni Ürün Ekle"}
            </button>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl bg-zinc-800 border border-zinc-700 p-3 text-sm">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Toplam ürün</p>
              <h2 className="text-xl font-bold mt-2">{products.length}</h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Toplam stok</p>
              <h2 className="text-xl font-bold mt-2 text-yellow-400">
                {formatNumber(totalStock)}
              </h2>
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
            {products.map((product) => {
              const isOpen =
                openProductId === product.id || editingId === product.id;

              return (
                <div
                  id={`product-${product.id}`}
                  key={product.id}
                  className="rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">{product.name}</h2>

                        <p className="text-sm text-zinc-400 mt-1">
                          {formatNumber(Number(product.price || 0))} TL /{" "}
                          {product.unit || "kg"}
                        </p>

                        <p className="text-sm text-yellow-400 mt-1">
                          Stok: {formatNumber(Number(product.stock || 0))}{" "}
                          {product.unit || "kg"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            product.active
                              ? "bg-green-500/10 text-green-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {product.active ? "Aktif" : "Pasif"}
                        </span>

                        <span className="text-xl text-zinc-400">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4">
                      {editingId === product.id ? (
                        <div className="rounded-3xl bg-zinc-950 border border-zinc-800 p-4 space-y-3 mt-2">
                          <h2 className="text-lg font-semibold">Ürün Düzenle</h2>

                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Ürün adı"
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

                          <input
                            type="text"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            placeholder="Stok miktarı"
                            className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
                          />

                          <select
                            value={editActive ? "aktif" : "pasif"}
                            onChange={(e) =>
                              setEditActive(e.target.value === "aktif")
                            }
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
                              Güncelle
                            </button>

                            <button
                              onClick={cancelEdit}
                              disabled={loading}
                              className="rounded-2xl bg-zinc-800 border border-zinc-700 p-4 font-semibold disabled:opacity-60"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-3">
                          <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4">
                            <p className="text-sm text-zinc-400">Mevcut stok</p>
                            <p className="text-lg font-semibold text-yellow-400 mt-1">
                              {formatNumber(Number(product.stock || 0))}{" "}
                              {product.unit || "kg"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => startEdit(product)}
                              className="rounded-2xl bg-white text-black px-4 py-3 text-sm font-semibold"
                            >
                              Düzenle
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="rounded-2xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm font-semibold"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
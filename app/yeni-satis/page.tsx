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

type CartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit: string;
  total_price: number;
};

export default function YeniSatisPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [kg, setKg] = useState("");
  const [price, setPrice] = useState("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const lineTotal = useMemo(() => {
    return kgNumber * priceNumber;
  }, [kgNumber, priceNumber]);

  const currentStock = Number(selectedProduct?.stock || 0);

  const reservedInCart = useMemo(() => {
    if (!selectedProductId) return 0;
    return cartItems
      .filter((item) => item.product_id === selectedProductId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems, selectedProductId]);

  const remainingStock = selectedProduct
    ? currentStock - reservedInCart - kgNumber
    : 0;

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [cartItems]);

  const resetProductForm = () => {
    setSelectedProductId("");
    setKg("");
    setPrice("");
  };

  const handleAddToCart = () => {
    setMessage("");

    if (!selectedCustomer) {
      setMessage("Müşteri seç");
      return;
    }

    if (!selectedProductId) {
      setMessage("Ürün seç");
      return;
    }

    if (!selectedProduct) {
      setMessage("Ürün bulunamadı");
      return;
    }

    if (isNaN(kgNumber) || kgNumber <= 0) {
      setMessage("Geçerli kg gir");
      return;
    }

    if (isNaN(priceNumber) || priceNumber <= 0) {
      setMessage("Geçerli fiyat gir");
      return;
    }

    const alreadyInCart = cartItems
      .filter((item) => item.product_id === selectedProductId)
      .reduce((sum, item) => sum + item.quantity, 0);

    const availableStock = currentStock - alreadyInCart;

    if (kgNumber > availableStock) {
      setMessage(
        `Yetersiz stok. Kullanılabilir stok: ${availableStock.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${selectedProduct.unit}`
      );
      return;
    }

    const newItem: CartItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: kgNumber,
      unit_price: priceNumber,
      unit: selectedProduct.unit,
      total_price: kgNumber * priceNumber,
    };

    setCartItems((prev) => [...prev, newItem]);
    setMessage("Ürün sepete eklendi");
    resetProductForm();
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSale = async () => {
    setMessage("");

    if (!selectedCustomer) {
      setMessage("Müşteri seç");
      return;
    }

    if (cartItems.length === 0) {
      setMessage("Önce sepete ürün ekle");
      return;
    }

    try {
      setLoading(true);

      const payload = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { data, error } = await supabase.rpc("create_sale_with_stock_multi", {
        p_customer_id: selectedCustomer,
        p_items: payload,
      });

      if (error) {
        setMessage(error.message || "Satış kaydedilemedi");
        await loadData();
        return;
      }

      setMessage("Tek fiş olarak satış başarıyla kaydedildi");
      setSelectedCustomer("");
      setCartItems([]);
      resetProductForm();

      await loadData();

      console.log("Olusan sale_id:", data?.sale_id);
    } catch {
      setMessage("Bir hata oluştu");
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
              <p className="text-zinc-400 text-sm">Yeni işlem</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Yeni Satış
              </h1>
              <p className="text-zinc-300 mt-1">
                Müşteri, ürün ve stok kontrollü satış
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              +
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <label className="block text-sm text-zinc-400 mb-2">Müşteri</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="">Müşteri seç</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <label className="block text-sm text-zinc-400 mb-2">Ürün</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            >
              <option value="">Ürün seç</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Stok:{" "}
                  {Number(product.stock || 0).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {product.unit}
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
              Seçilen Ürün
            </label>
            <input
              type="text"
              value={
                selectedProduct
                  ? `${selectedProduct.name} / ${selectedProduct.unit}`
                  : ""
              }
              readOnly
              placeholder="Ürün seçilmedi"
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
                <p className="text-sm text-zinc-400">Satış sonrası stok</p>
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

          <div className="mt-4">
            <button
              onClick={handleAddToCart}
              type="button"
              className="w-full rounded-3xl bg-white text-black p-4 text-base font-semibold"
            >
              Sepete Ekle
            </button>
          </div>

          <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-sm text-zinc-400 mb-3">Sepetteki Ürünler</p>

            {cartItems.length === 0 ? (
              <p className="text-sm text-zinc-500">Henüz ürün eklenmedi</p>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.product_id}-${index}`}
                    className="rounded-2xl bg-zinc-800 border border-zinc-700 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-zinc-400 mt-1">
                          {item.quantity.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {item.unit}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {item.unit_price.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          TL
                        </p>
                        <p className="text-sm text-green-400 mt-1">
                          {item.total_price.toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          TL
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(index)}
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 p-5">
            <p className="text-sm text-zinc-400">Genel Toplam</p>
            <h2 className="text-4xl font-bold text-green-400 mt-2">
              {cartTotal.toLocaleString("tr-TR", {
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
              {loading ? "Kaydediliyor..." : "Tek Fiş Oluştur"}
            </button>

            <button
              type="button"
              className="rounded-3xl bg-zinc-700 text-white p-4 text-base font-semibold"
              onClick={() => {
                setCartItems([]);
                setMessage("Sepet temizlendi");
              }}
            >
              Sepeti Temizle
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
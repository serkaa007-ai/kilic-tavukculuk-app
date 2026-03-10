"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  status: string | null;
  balance: number | null;
};

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState("Temiz");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    setCustomers((data as Customer[]) || []);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddCustomer = async () => {
    setMessage("");

    if (!name.trim()) {
      setMessage("Musteri adi gir");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("customers").insert([
        {
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
          status: "Temiz",
          balance: 0,
        },
      ]);

      if (error) {
        setMessage("Musteri eklenemedi");
        return;
      }

      setName("");
      setPhone("");
      setAddress("");
      setMessage("Musteri basariyla eklendi");
      await loadCustomers();
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setEditName(customer.name || "");
    setEditPhone(customer.phone || "");
    setEditAddress(customer.address || "");
    setEditStatus(customer.status || "Temiz");
    setMessage("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPhone("");
    setEditAddress("");
    setEditStatus("Temiz");
  };

  const handleUpdateCustomer = async () => {
    if (!editingId) return;

    setMessage("");

    if (!editName.trim()) {
      setMessage("Musteri adi gir");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("customers")
        .update({
          name: editName.trim(),
          phone: editPhone.trim() || null,
          address: editAddress.trim() || null,
          status: editStatus,
        })
        .eq("id", editingId);

      if (error) {
        setMessage("Musteri guncellenemedi");
        return;
      }

      setMessage("Musteri basariyla guncellendi");
      cancelEdit();
      await loadCustomers();
    } catch {
      setMessage("Bir hata olustu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    const ok = window.confirm("Bu musteri silinsin mi?");
    if (!ok) return;

    setMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) {
        setMessage("Musteri silinemedi");
        return;
      }

      if (editingId === id) {
        cancelEdit();
      }

      setMessage("Musteri silindi");
      await loadCustomers();
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
              <p className="text-zinc-400 text-sm">Musteri yonetimi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Musteriler
              </h1>
              <p className="text-zinc-300 mt-1">Ekle, duzenle, sil</p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              M
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Yeni Musteri Ekle</h2>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Musteri adi"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefon"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adres"
              className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
            />

            <button
              onClick={handleAddCustomer}
              disabled={loading}
              className="w-full rounded-2xl bg-white text-black p-4 font-semibold disabled:opacity-60"
            >
              {loading ? "Isleniyor..." : "+ Yeni Musteri Ekle"}
            </button>
          </div>

          {editingId && (
            <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <h2 className="text-lg font-semibold">Musteri Duzenle</h2>

              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Musteri adi"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />

              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Telefon"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />

              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Adres"
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              />

              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 p-4 text-white outline-none"
              >
                <option value="Temiz">Temiz</option>
                <option value="Borclu">Borclu</option>
                <option value="Duzenli">Duzenli</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleUpdateCustomer}
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
              <h2 className="text-xl font-bold mt-2">{customers.length}</h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Borclu</p>
              <h2 className="text-xl font-bold mt-2 text-red-400">
                {customers.filter((c) => c.status === "Borclu").length}
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-xs text-zinc-400">Temiz</p>
              <h2 className="text-xl font-bold mt-2 text-green-400">
                {customers.filter((c) => c.status === "Temiz").length}
              </h2>
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{customer.name}</h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      Telefon: {customer.phone || "-"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Adres: {customer.address || "-"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      customer.status === "Borclu"
                        ? "bg-red-500/10 text-red-400"
                        : customer.status === "Duzenli"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-green-500/10 text-green-400"
                    }`}
                  >
                    {customer.status || "Temiz"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-zinc-400 text-sm">Bakiye</span>
                  <span className="text-lg font-bold text-white">
                    {Number(customer.balance || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    TL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => startEdit(customer)}
                    className="rounded-2xl bg-white text-black px-4 py-3 text-sm font-semibold"
                  >
                    Duzenle
                  </button>

                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
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
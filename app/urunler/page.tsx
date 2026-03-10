"use client";

import { useEffect, useMemo, useState } from "react";

type Urun = {
  id: string;
  ad: string;
  kategori: string;
  fiyat: number;
};

const VARSAYILAN_URUNLER: Urun[] = [
  { id: "1", ad: "Derili Bonfile", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "2", ad: "Bonfile", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "3", ad: "İncik", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "4", ad: "Kanat", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "5", ad: "Pirzola", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "6", ad: "Baget", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "7", ad: "Göğüs", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "8", ad: "Kalçalı But", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "9", ad: "But", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "10", ad: "Fileto", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "11", ad: "Kemiksiz But", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "12", ad: "Tüm Tavuk", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "13", ad: "Yarım Tavuk", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "14", ad: "Izgaralık Kanat", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "15", ad: "Kanat Uç", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "16", ad: "Tavuk Kelebek", kategori: "Tavuk Ürünleri", fiyat: 0 },
  { id: "17", ad: "Tavuk Ciğer", kategori: "Sakatat", fiyat: 0 },
  { id: "18", ad: "Taşlık", kategori: "Sakatat", fiyat: 0 },
  { id: "19", ad: "Tavuk Boyun", kategori: "Diğer", fiyat: 0 },
  { id: "20", ad: "Tavuk Suyu Seti", kategori: "Diğer", fiyat: 0 },
  { id: "21", ad: "Tavuk Deri", kategori: "Diğer", fiyat: 0 },
  { id: "22", ad: "Soslu Kanat", kategori: "Marineli", fiyat: 0 },
  { id: "23", ad: "Soslu Bonfile", kategori: "Marineli", fiyat: 0 },
  { id: "24", ad: "Tavuk Şiş", kategori: "Hazır Ürün", fiyat: 0 },
  { id: "25", ad: "Tavuk Döner", kategori: "Hazır Ürün", fiyat: 0 },
];

const STORAGE_KEY = "urunler";

export default function UrunlerPage() {
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [yeniUrun, setYeniUrun] = useState("");
  const [yeniKategori, setYeniKategori] = useState("Tavuk Ürünleri");
  const [yeniFiyat, setYeniFiyat] = useState("");
  const [acikUrunId, setAcikUrunId] = useState<string | null>(null);

  useEffect(() => {
    const kayitli = localStorage.getItem(STORAGE_KEY);

    if (kayitli) {
      try {
        const parsed = JSON.parse(kayitli);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUrunler(parsed);
          return;
        }
      } catch {}
    }

    setUrunler(VARSAYILAN_URUNLER);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(VARSAYILAN_URUNLER));
  }, []);

  useEffect(() => {
    if (urunler.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(urunler));
    }
  }, [urunler]);

  const kategoriler = useMemo(() => {
    const hepsi = urunler.map((u) => u.kategori);
    return [...new Set(["Tavuk Ürünleri", "Sakatat", "Marineli", "Hazır Ürün", "Diğer", ...hepsi])];
  }, [urunler]);

  const urunEkle = () => {
    if (!yeniUrun.trim()) return;

    const yeniKayit: Urun = {
      id: Date.now().toString(),
      ad: yeniUrun.trim(),
      kategori: yeniKategori,
      fiyat: Number(yeniFiyat) || 0,
    };

    setUrunler((prev) => [...prev, yeniKayit]);
    setYeniUrun("");
    setYeniKategori("Tavuk Ürünleri");
    setYeniFiyat("");
  };

  const urunSil = (id: string) => {
    setUrunler((prev) => prev.filter((urun) => urun.id !== id));
    if (acikUrunId === id) setAcikUrunId(null);
  };

  const toggleUrun = (id: string) => {
    setAcikUrunId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Ürünler</h1>

          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Ürün adı"
              value={yeniUrun}
              onChange={(e) => setYeniUrun(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            />

            <select
              value={yeniKategori}
              onChange={(e) => setYeniKategori(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            >
              {kategoriler.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Fiyat"
              value={yeniFiyat}
              onChange={(e) => setYeniFiyat(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
            />

            <button
              onClick={urunEkle}
              className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Ürün Ekle
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {urunler.map((urun) => {
            const acik = acikUrunId === urun.id;

            return (
              <div key={urun.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => toggleUrun(urun.id)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-900">{urun.ad}</p>
                    <p className="mt-1 text-sm text-gray-500">{urun.kategori}</p>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{acik ? "−" : "+"}</span>
                </button>

                {acik && (
                  <div className="border-t bg-gray-50 px-4 py-4">
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-semibold text-gray-900">Ürün Adı:</span> {urun.ad}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Kategori:</span> {urun.kategori}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900">Fiyat:</span> {urun.fiyat} TL
                      </p>
                    </div>

                    <button
                      onClick={() => urunSil(urun.id)}
                      className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Ürünü Sil
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
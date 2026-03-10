import Link from "next/link";
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
  } | null;
  sale_items: SaleItem[];
};

export default async function GecmisFislerPage() {
  const { data: sales } = await supabase
    .from("sales")
    .select(
      `
      id,
      total_amount,
      payment_status,
      created_at,
      customers (
        name
      ),
      sale_items (
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `
    )
    .order("created_at", { ascending: false });

  const typedSales = (sales || []) as unknown as Sale[];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 border-x border-zinc-900 flex flex-col">
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Satis gecmisi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Gecmis Fisler
              </h1>
              <p className="text-zinc-300 mt-1">Kaydedilen tum satislar</p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              F
            </div>
          </div>

          <div className="space-y-3 mt-5">
            {typedSales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {sale.customers?.name || "Musteri yok"}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {new Date(sale.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  <span className="text-green-400 font-bold">
                    {(sale.total_amount || 0).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    TL
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {sale.sale_items?.map((item, index) => (
                    <div
                      key={index}
                      className="text-sm text-zinc-300 border-b border-zinc-800 pb-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{item.product_name || "-"}</span>
                        <span>
                          {(item.total_price || 0).toLocaleString("tr-TR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          TL
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-1">
                        {(item.quantity || 0).toLocaleString("tr-TR")} kg x{" "}
                        {(item.unit_price || 0).toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        TL
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      sale.payment_status === "Bekliyor"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-green-500/10 text-green-400"
                    }`}
                  >
                    {sale.payment_status || "Bekliyor"}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/fis/${sale.id}`}
                      className="rounded-2xl bg-white text-black px-4 py-2 text-sm font-semibold"
                    >
                      Goruntule
                    </Link>

                    <Link
                      href={`/fis/${sale.id}`}
                      className="rounded-2xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm font-semibold"
                    >
                      Yazdir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
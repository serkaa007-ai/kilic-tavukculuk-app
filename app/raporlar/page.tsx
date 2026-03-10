import { supabase } from "@/lib/supabase";

type SaleItem = {
  product_name: string | null;
  quantity: number | null;
  total_price: number | null;
};

export default async function RaporlarPage() {
  const { data: sales } = await supabase
    .from("sales")
    .select(
      `
      id,
      total_amount,
      payment_status,
      created_at,
      sale_items (
        product_name,
        quantity,
        total_price
      )
    `
    )
    .order("created_at", { ascending: false });

  const allSales = sales || [];

  const totalSales = allSales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const pendingPayments = allSales
    .filter((sale) => sale.payment_status === "Bekliyor")
    .reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  const paidSales = totalSales - pendingPayments;

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const dailySales = allSales
    .filter((sale) => sale.created_at?.slice(0, 10) === todayKey)
    .reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  const weeklySales = allSales
    .filter((sale) => {
      const saleDate = new Date(sale.created_at);
      const diffMs = today.getTime() - saleDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    })
    .reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  const monthlySales = allSales
    .filter((sale) => {
      const saleDate = new Date(sale.created_at);
      return (
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);

  const allItems: SaleItem[] = allSales.flatMap(
    (sale) => (sale.sale_items as SaleItem[]) || []
  );

  const productMap = new Map<string, { qty: number; total: number }>();

  allItems.forEach((item) => {
    const name = item.product_name || "Bilinmeyen";
    const old = productMap.get(name) || { qty: 0, total: 0 };
    productMap.set(name, {
      qty: old.qty + Number(item.quantity || 0),
      total: old.total + Number(item.total_price || 0),
    });
  });

  const sortedProducts = Array.from(productMap.entries()).sort(
    (a, b) => b[1].qty - a[1].qty
  );

  const bestProduct = sortedProducts[0];

  const averageReceipt =
    allSales.length > 0 ? totalSales / allSales.length : 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto min-h-screen bg-zinc-950 border-x border-zinc-900 flex flex-col">
        <div className="px-5 pt-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Satis analizi</p>
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Raporlar
              </h1>
              <p className="text-zinc-300 mt-1">Gercek verilerle performans</p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl font-bold shadow-lg shadow-red-900/30">
              R
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Gunluk Satis</p>
              <h2 className="text-2xl font-bold mt-2">
                {dailySales.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Haftalik Ciro</p>
              <h2 className="text-2xl font-bold mt-2">
                {weeklySales.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Aylik Ciro</p>
              <h2 className="text-2xl font-bold mt-2 text-green-400">
                {monthlySales.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>

            <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="text-sm text-zinc-400">Bekleyen Odeme</p>
              <h2 className="text-2xl font-bold mt-2 text-red-400">
                {pendingPayments.toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                TL
              </h2>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-zinc-900 border border-zinc-800 p-5">
            <p className="text-sm text-zinc-400">En Cok Satan Urun</p>
            <h2 className="text-2xl font-bold mt-2 text-green-400">
              {bestProduct ? bestProduct[0] : "Veri yok"}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              {bestProduct
                ? `${bestProduct[1].qty.toLocaleString("tr-TR")} kg satis`
                : "Henuz satis yok"}
            </p>
          </div>

          <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-5">
            <p className="text-sm text-zinc-400">Toplam Tahsilat</p>
            <h2 className="text-2xl font-bold mt-2">
              {paidSales.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              TL
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Odenmis satis toplami
            </p>
          </div>

          <div className="mt-4 rounded-3xl bg-zinc-900 border border-zinc-800 p-5">
            <p className="text-sm text-zinc-400 mb-3">Hizli Ozet</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Toplam fis</span>
                <span className="font-semibold">{allSales.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Ortalama fis tutari</span>
                <span className="font-semibold">
                  {averageReceipt.toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  TL
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Tahsilat orani</span>
                <span className="font-semibold text-green-400">
                  {totalSales > 0
                    ? `%${((paidSales / totalSales) * 100).toFixed(0)}`
                    : "%0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
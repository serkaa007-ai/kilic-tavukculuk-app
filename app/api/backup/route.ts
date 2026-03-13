import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const [customers, products, sales, saleItems, payments] = await Promise.all([
      supabaseAdmin.from("customers").select("*"),
      supabaseAdmin.from("products").select("*"),
      supabaseAdmin.from("sales").select("*"),
      supabaseAdmin.from("sale_items").select("*"),
      supabaseAdmin.from("payments").select("*"),
    ]);

    const backup = {
      createdAt: new Date().toISOString(),
      app: "kilic-tavukculuk",
      version: 1,
      data: {
        customers: customers.data ?? [],
        products: products.data ?? [],
        sales: sales.data ?? [],
        sale_items: saleItems.data ?? [],
        payments: payments.data ?? [],
      },
    };

    const now = new Date();
    const fileName = `daily/${now.toISOString().slice(0, 10)}-backup.json`;

    const { error } = await supabaseAdmin.storage
      .from("backups")
      .upload(fileName, JSON.stringify(backup, null, 2), {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      fileName,
      createdAt: backup.createdAt,
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Otomatik yedek alınamadı" },
      { status: 500 }
    );
  }
}
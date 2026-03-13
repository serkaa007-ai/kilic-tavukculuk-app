import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

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

    return new Response(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="kilic-backup-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: "Yedek oluşturulamadı" },
      { status: 500 }
    );
  }
}
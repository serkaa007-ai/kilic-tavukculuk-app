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

    if (customers.error) throw new Error(`customers: ${customers.error.message}`);
    if (products.error) throw new Error(`products: ${products.error.message}`);
    if (sales.error) throw new Error(`sales: ${sales.error.message}`);
    if (saleItems.error) throw new Error(`sale_items: ${saleItems.error.message}`);
    if (payments.error) throw new Error(`payments: ${payments.error.message}`);

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
      throw new Error(`storage: ${error.message}`);
    }

    return Response.json({
      ok: true,
      fileName,
      createdAt: backup.createdAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen hata";

    return Response.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
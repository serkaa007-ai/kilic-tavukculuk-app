import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function parseBackupDateFromName(fileName: string) {
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-backup\.json$/);
  if (!match) return null;

  const date = new Date(`${match[1]}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

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
    const today = now.toISOString().slice(0, 10);
    const fileName = `daily/${today}-backup.json`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("backups")
      .upload(fileName, JSON.stringify(backup, null, 2), {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`storage upload: ${uploadError.message}`);
    }

    // 15 gunden eski yedekleri sil
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("backups")
      .list("daily", {
        limit: 100,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      throw new Error(`storage list: ${listError.message}`);
    }

    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - 15);
    cutoff.setUTCHours(0, 0, 0, 0);

    const filesToDelete =
      files
        ?.filter((file) => {
          const fileDate = parseBackupDateFromName(file.name);
          return fileDate && fileDate < cutoff;
        })
        .map((file) => `daily/${file.name}`) ?? [];

    if (filesToDelete.length > 0) {
      const { error: removeError } = await supabaseAdmin.storage
        .from("backups")
        .remove(filesToDelete);

      if (removeError) {
        throw new Error(`storage remove: ${removeError.message}`);
      }
    }

    return Response.json({
      ok: true,
      fileName,
      deletedOldBackups: filesToDelete.length,
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
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type BackupPayload = {
  createdAt?: string;
  app?: string;
  version?: number;
  data?: {
    customers?: any[];
    products?: any[];
    sales?: any[];
    sale_items?: any[];
    payments?: any[];
  };
};

function toArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = (await req.json()) as BackupPayload;

    if (!body || typeof body !== "object" || !body.data) {
      return Response.json(
        { ok: false, error: "Gecersiz yedek dosyasi" },
        { status: 400 }
      );
    }

    const customers = toArray(body.data.customers);
    const products = toArray(body.data.products);
    const sales = toArray(body.data.sales);
    const saleItems = toArray(body.data.sale_items);
    const payments = toArray(body.data.payments);

    const deletePayments = await supabaseAdmin
      .from("payments")
      .delete()
      .not("id", "is", null);

    if (deletePayments.error) {
      throw new Error(`payments silinemedi: ${deletePayments.error.message}`);
    }

    const deleteSaleItems = await supabaseAdmin
      .from("sale_items")
      .delete()
      .not("id", "is", null);

    if (deleteSaleItems.error) {
      throw new Error(`sale_items silinemedi: ${deleteSaleItems.error.message}`);
    }

    const deleteSales = await supabaseAdmin
      .from("sales")
      .delete()
      .not("id", "is", null);

    if (deleteSales.error) {
      throw new Error(`sales silinemedi: ${deleteSales.error.message}`);
    }

    const deleteCustomers = await supabaseAdmin
      .from("customers")
      .delete()
      .not("id", "is", null);

    if (deleteCustomers.error) {
      throw new Error(`customers silinemedi: ${deleteCustomers.error.message}`);
    }

    const deleteProducts = await supabaseAdmin
      .from("products")
      .delete()
      .not("id", "is", null);

    if (deleteProducts.error) {
      throw new Error(`products silinemedi: ${deleteProducts.error.message}`);
    }

    if (customers.length > 0) {
      const insertCustomers = await supabaseAdmin.from("customers").insert(customers);
      if (insertCustomers.error) {
        throw new Error(`customers yuklenemedi: ${insertCustomers.error.message}`);
      }
    }

    if (products.length > 0) {
      const insertProducts = await supabaseAdmin.from("products").insert(products);
      if (insertProducts.error) {
        throw new Error(`products yuklenemedi: ${insertProducts.error.message}`);
      }
    }

    if (sales.length > 0) {
      const insertSales = await supabaseAdmin.from("sales").insert(sales);
      if (insertSales.error) {
        throw new Error(`sales yuklenemedi: ${insertSales.error.message}`);
      }
    }

    if (saleItems.length > 0) {
      const insertSaleItems = await supabaseAdmin.from("sale_items").insert(saleItems);
      if (insertSaleItems.error) {
        throw new Error(`sale_items yuklenemedi: ${insertSaleItems.error.message}`);
      }
    }

    if (payments.length > 0) {
      const insertPayments = await supabaseAdmin.from("payments").insert(payments);
      if (insertPayments.error) {
        throw new Error(`payments yuklenemedi: ${insertPayments.error.message}`);
      }
    }

    return Response.json({
      ok: true,
      message: "Yedek basariyla geri yuklendi",
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
// src/services/apiProduk.js
import { supabase } from "../config/supabaseClient";

// Mengambil seluruh daftar produk/katalog roti
export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true }); // Mengurutkan alfabetis berdasarkan nama roti
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Eror mengambil data produk cloud:", error.message);
    return [];
  }
}

// Memperbarui jumlah stok produk tertentu
export async function updateProductStock(productId, newStock) {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ stock: parseInt(newStock, 10) })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Gagal memperbarui stok produk:", error.message);
    return { success: false, message: error.message };
  }
}
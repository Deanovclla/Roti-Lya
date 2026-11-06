// src/services/apiPesanan.js
import { supabase } from "../config/supabaseClient";

// 1. Mencatatkan pesanan baru (Offline Kasir / Input Manual)
export async function createOrder(orderData) {
  try {
    const totalPrice = parseInt(orderData.total_price, 10) || 0;
    const amountPaid = parseInt(orderData.amount_paid, 10) || 0;
    
    // Otomatisasi perhitungan sisa tagihan demi validitas manajemen risiko keuangan
    const calculatedSisaTagihan = totalPrice - amountPaid;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: orderData.customer_name,
          detail_order: orderData.detail_order || orderData.details,
          total_price: totalPrice,
          amount_paid: amountPaid,
          sisa_tagihan: calculatedSisaTagihan >= 0 ? calculatedSisaTagihan : 0,
          type: orderData.type || 'Manual', // Manual (Cash) atau Transfer/QRIS
          status: orderData.status || 'Antrean Oven', // Status awal proses pembuatan kue
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Gagal mencatat pesanan baru:", error.message);
    return { success: false, message: error.message };
  }
}

// 2. Mengambil semua daftar pesanan untuk "Antrean Oven" (Proses)
export async function getActiveOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: true }); // Yang paling lama mengantre ada di atas

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Gagal mengambil data antrean pesanan:", error.message);
    return [];
  }
}

// 3. Memperbarui status pesanan (Contoh: Dari 'Antrean Oven' ke 'Selesai')
export async function updateOrderStatus(orderId, nextStatus) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Gagal memperbarui status pesanan:", error.message);
    return { success: false, message: error.message };
  }
}
// src/services/apiLaporan.js
import { supabase } from "../config/supabaseClient";

// Mengambil ringkasan data transaksi khusus untuk kalkulasi laporan keuangan
export async function getFinancialSummary() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("id, total_price, amount_paid, sisa_tagihan, type, created_at");

    if (error) throw error;

    if (!data || data.length === 0) {
      return { totalOmzet: 0, totalTunai: 0, totalTransfer: 0, totalPiutang: 0, rawData: [] };
    }

    // Ekstraksi logika matematika keuangan langsung dari data server
    const totalOmzet = data.reduce((sum, item) => sum + (parseInt(item.total_price, 10) || 0), 0);
    const totalTunai = data.filter(item => item.type === 'Manual').reduce((sum, item) => sum + (parseInt(item.amount_paid, 10) || 0), 0);
    const totalTransfer = data.filter(item => item.type !== 'Manual').reduce((sum, item) => sum + (parseInt(item.amount_paid, 10) || 0), 0);
    const totalPiutang = data.reduce((sum, item) => sum + (parseInt(item.sisa_tagihan, 10) || 0), 0);

    return {
      totalOmzet,
      totalTunai,
      totalTransfer,
      totalPiutang,
      rawData: data
    };
  } catch (error) {
    console.error("Gagal memformulasikan laporan keuangan:", error.message);
    return { totalOmzet: 0, totalTunai: 0, totalTransfer: 0, totalPiutang: 0, rawData: [] };
  }
}
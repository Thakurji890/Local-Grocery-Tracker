import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDateTime } from './gst';

const STORE = {
  name: import.meta.env.VITE_STORE_NAME || 'Kirana Store',
  gstin: import.meta.env.VITE_STORE_GSTIN || '',
};

/**
 * Generate and download a PDF receipt for a bill
 * @param {Object} bill - Full bill object from API
 */
export const generateReceiptPDF = (bill) => {
  const doc = new jsPDF({ unit: 'mm', format: [80, 200], orientation: 'portrait' });

  const pageW = doc.internal.pageSize.getWidth();
  let y = 8;

  const centerText = (text, fontSize = 10, style = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    doc.text(text, pageW / 2, y, { align: 'center' });
    y += fontSize * 0.4 + 2;
  };

  const line = () => {
    doc.setDrawColor(200);
    doc.line(4, y, pageW - 4, y);
    y += 3;
  };

  const row = (label, value, bold = false) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, 4, y);
    doc.text(String(value), pageW - 4, y, { align: 'right' });
    y += 4.5;
  };

  // Header
  centerText(STORE.name, 11, 'bold');
  if (bill.storeGstin) { centerText(`GSTIN: ${bill.storeGstin}`, 7); }
  centerText(`Bill No: ${bill.billNumber}`, 8, 'bold');
  centerText(formatDateTime(bill.createdAt), 7);
  if (bill.staffName) centerText(`Cashier: ${bill.staffName}`, 7);
  if (bill.customerName) centerText(`Customer: ${bill.customerName}`, 7);
  if (bill.customerPhone) centerText(`Phone: ${bill.customerPhone}`, 7);
  line();

  // Items table
  const tableData = bill.items.map(item => [
    item.productName.substring(0, 20),
    `${item.quantity}`,
    `₹${item.sellingPrice.toFixed(2)}`,
    item.gstRate > 0 ? `${item.gstRate}%` : '-',
    `₹${item.totalAmount.toFixed(2)}`,
  ]);

  doc.autoTable({
    startY: y,
    head: [['Item', 'Qty', 'Price', 'GST', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fontStyle: 'bold', fillColor: [245, 245, 245] },
    columnStyles: { 4: { halign: 'right' } },
    margin: { left: 4, right: 4 },
  });

  y = doc.lastAutoTable.finalY + 4;
  line();

  // Totals
  row('Subtotal (excl. GST)', `₹${bill.subtotal?.toFixed(2)}`);
  if (bill.totalDiscount > 0) row('Item Discount', `-₹${bill.totalDiscount?.toFixed(2)}`);
  if (bill.billDiscountAmount > 0) row(`Bill Discount (${bill.billDiscountPercent}%)`, `-₹${bill.billDiscountAmount?.toFixed(2)}`);
  if (bill.totalCgst > 0) row(`CGST`, `₹${bill.totalCgst?.toFixed(2)}`);
  if (bill.totalSgst > 0) row(`SGST`, `₹${bill.totalSgst?.toFixed(2)}`);
  if (bill.roundOff !== 0) row('Round Off', `₹${bill.roundOff?.toFixed(2)}`);
  line();
  row('GRAND TOTAL', `₹${bill.grandTotal?.toFixed(2)}`, true);
  row('Payment', bill.paymentMode?.toUpperCase());
  if (bill.upiTransactionId) row('UPI Txn ID', bill.upiTransactionId);
  line();

  // GST Summary
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('GST Summary', 4, y); y += 4.5;

  const gstGroups = {};
  bill.items.forEach(item => {
    if (item.gstRate > 0) {
      if (!gstGroups[item.gstRate]) gstGroups[item.gstRate] = { taxable: 0, cgst: 0, sgst: 0 };
      gstGroups[item.gstRate].taxable += item.baseAmount;
      gstGroups[item.gstRate].cgst += item.cgstAmount;
      gstGroups[item.gstRate].sgst += item.sgstAmount;
    }
  });

  Object.entries(gstGroups).forEach(([rate, val]) => {
    row(`${rate}% GST | Taxable: ₹${val.taxable.toFixed(2)}`, `C+S: ₹${(val.cgst + val.sgst).toFixed(2)}`);
  });

  line();
  centerText('Thank you for shopping!', 8, 'bold');
  centerText('Please visit again 🙏', 7);

  // Save
  doc.save(`Receipt_${bill.billNumber}.pdf`);
};

/**
 * Generate GSTR-1 summary PDF
 */
export const generateGSTR1PDF = (data, month) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`GSTR-1 Report — ${month}`, 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Store GSTIN: ${STORE.gstin}`, 14, 30);
  doc.text(`Total Bills: ${data.totalBills} | Total Revenue: ₹${data.totalRevenue?.toFixed(2)} | Total GST: ₹${data.totalGst?.toFixed(2)}`, 14, 37);

  // GST rate summary
  doc.autoTable({
    startY: 45,
    head: [['GST Rate', 'Taxable Value', 'CGST', 'SGST', 'Total GST', 'Total Value']],
    body: data.gstSummary.map(g => [
      `${g.gstRate}%`,
      `₹${g.taxableValue?.toFixed(2)}`,
      `₹${g.cgst?.toFixed(2)}`,
      `₹${g.sgst?.toFixed(2)}`,
      `₹${g.totalGst?.toFixed(2)}`,
      `₹${g.totalValue?.toFixed(2)}`,
    ]),
    theme: 'striped',
  });

  doc.save(`GSTR1_${month}.pdf`);
};

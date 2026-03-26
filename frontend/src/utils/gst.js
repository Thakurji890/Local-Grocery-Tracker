/**
 * Frontend GST utilities — mirrors backend gstCalculator.js
 * Used in the billing POS page for real-time calculations
 */

export const GST_RATES = [0, 5, 12, 18, 28];

export const calculateItemGst = (sellingPrice, quantity, gstRate, discountPercent = 0, priceIncludesGst = true) => {
  const totalBeforeDiscount = sellingPrice * quantity;
  const discountAmount = (totalBeforeDiscount * discountPercent) / 100;
  const amountAfterDiscount = totalBeforeDiscount - discountAmount;

  let baseAmount, gstAmount;
  if (priceIncludesGst && gstRate > 0) {
    baseAmount = parseFloat((amountAfterDiscount / (1 + gstRate / 100)).toFixed(2));
    gstAmount = parseFloat((amountAfterDiscount - baseAmount).toFixed(2));
  } else {
    baseAmount = amountAfterDiscount;
    gstAmount = parseFloat((baseAmount * gstRate / 100).toFixed(2));
  }

  const cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  const sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));

  return { baseAmount, discountAmount: parseFloat(discountAmount.toFixed(2)), gstAmount, cgstAmount, sgstAmount, totalAmount };
};

export const processBill = (cartItems, billDiscountPercent = 0) => {
  let subtotal = 0, totalGst = 0, totalCgst = 0, totalSgst = 0, totalItemDiscount = 0;

  const items = cartItems.map(item => {
    const calc = calculateItemGst(item.sellingPrice, item.quantity, item.gstRate, item.discountPercent || 0, item.priceIncludesGst !== false);
    subtotal += calc.baseAmount;
    totalGst += calc.gstAmount;
    totalCgst += calc.cgstAmount;
    totalSgst += calc.sgstAmount;
    totalItemDiscount += calc.discountAmount;
    return { ...item, ...calc };
  });

  const subtotalWithGst = subtotal + totalGst;
  const billDiscountAmount = parseFloat((subtotalWithGst * billDiscountPercent / 100).toFixed(2));
  const grandTotalBeforeRound = subtotalWithGst - billDiscountAmount;
  const grandTotal = Math.round(grandTotalBeforeRound);
  const roundOff = parseFloat((grandTotal - grandTotalBeforeRound).toFixed(2));

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalItemDiscount: parseFloat(totalItemDiscount.toFixed(2)),
    totalGst: parseFloat(totalGst.toFixed(2)),
    totalCgst: parseFloat(totalCgst.toFixed(2)),
    totalSgst: parseFloat(totalSgst.toFixed(2)),
    billDiscountAmount,
    grandTotal,
    roundOff,
  };
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

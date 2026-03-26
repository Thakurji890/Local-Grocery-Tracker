/**
 * gstCalculator.js
 * Handles all GST/CGST/SGST calculations as per Indian tax rules.
 * For intra-state (within same state) sales: GST = CGST + SGST (split equally).
 * For inter-state sales: Only IGST applies (not implemented here for kirana stores).
 */

/**
 * Calculate GST breakdown for a bill item
 * @param {number} sellingPrice - Price per unit (can be GST-inclusive)
 * @param {number} quantity - Number of units
 * @param {number} gstRate - GST % (e.g., 18)
 * @param {number} discountPercent - Item-level discount %
 * @param {boolean} priceIncludesGst - Whether sellingPrice includes GST
 */
const calculateItemGst = (sellingPrice, quantity, gstRate, discountPercent = 0, priceIncludesGst = true) => {
  const totalBeforeDiscount = sellingPrice * quantity;
  const discountAmount = (totalBeforeDiscount * discountPercent) / 100;
  const amountAfterDiscount = totalBeforeDiscount - discountAmount;

  let baseAmount, gstAmount;

  if (priceIncludesGst && gstRate > 0) {
    // Back-calculate base price from GST-inclusive price
    // Formula: Base = Total / (1 + GST_Rate/100)
    baseAmount = parseFloat((amountAfterDiscount / (1 + gstRate / 100)).toFixed(2));
    gstAmount = parseFloat((amountAfterDiscount - baseAmount).toFixed(2));
  } else {
    baseAmount = amountAfterDiscount;
    gstAmount = parseFloat((baseAmount * gstRate / 100).toFixed(2));
  }

  // CGST = SGST = GST / 2 (for intra-state sales)
  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  const sgstAmount = parseFloat((gstAmount / 2).toFixed(2));
  const totalAmount = parseFloat((baseAmount + gstAmount).toFixed(2));

  return {
    baseAmount,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    gstRate,
    cgstRate,
    sgstRate,
    gstAmount,
    cgstAmount,
    sgstAmount,
    totalAmount,
  };
};

/**
 * Process all bill items and compute totals
 * @param {Array} items - Array of { product, quantity, discountPercent, ... }
 * @param {number} billDiscountPercent - Overall bill-level discount
 */
const processBillItems = (items, billDiscountPercent = 0) => {
  let subtotal = 0;
  let totalGst = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalItemDiscount = 0;

  const processedItems = items.map(item => {
    const calc = calculateItemGst(
      item.sellingPrice,
      item.quantity,
      item.gstRate,
      item.discountPercent || 0,
      item.priceIncludesGst !== false
    );

    subtotal += calc.baseAmount;
    totalGst += calc.gstAmount;
    totalCgst += calc.cgstAmount;
    totalSgst += calc.sgstAmount;
    totalItemDiscount += calc.discountAmount;

    return {
      ...item,
      ...calc,
    };
  });

  const subtotalWithGst = subtotal + totalGst;

  // Apply bill-level discount on the grand total
  const billDiscountAmount = parseFloat((subtotalWithGst * billDiscountPercent / 100).toFixed(2));
  const grandTotalBeforeRound = subtotalWithGst - billDiscountAmount;

  // Round off to nearest rupee
  const grandTotal = Math.round(grandTotalBeforeRound);
  const roundOff = parseFloat((grandTotal - grandTotalBeforeRound).toFixed(2));

  return {
    items: processedItems,
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

module.exports = { calculateItemGst, processBillItems };

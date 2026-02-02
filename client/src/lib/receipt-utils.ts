/**
 * Extract amount (and optional title) from OCR receipt/invoice text using JS.
 * Looks for "Total", "Grand Total", "Amount" etc. and parses the number.
 */
export function extractAmountFromReceiptText(text: string): { amount: number } {
  if (!text || !text.trim()) return { amount: 0 };

  const normalized = text.replace(/\r\n/g, "\n").trim();

  // Match Total / Grand Total / Amount Chargeable followed by number (e.g. 45,998.00 or 45998)
  const patterns = [
    /Total\s*[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/i,
    /Grand\s*Total\s*[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/i,
    /Amount\s*Chargeable[\s\S]*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/i,
    /(?:Total|Amount)\s+(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/i,
  ];

  for (const re of patterns) {
    const m = normalized.match(re);
    if (m && m[1]) {
      const numStr = m[1].replace(/,/g, "");
      const num = parseFloat(numStr);
      if (!Number.isNaN(num) && num > 0) return { amount: num };
    }
  }

  // Fallback: find last number that looks like currency (has .00 or ,000)
  const currencyLike = normalized.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
  if (currencyLike && currencyLike.length > 0) {
    const last = currencyLike[currencyLike.length - 1];
    const num = parseFloat(last.replace(/,/g, ""));
    if (!Number.isNaN(num) && num > 0) return { amount: num };
  }

  return { amount: 0 };
}

// Extract printed information only. Billing quantities never imply a dose or course.
export function parseMedicineBill(text) {
  const medicines = [];
  const seen = new Set();
  let inTable = false;
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/\b(?:medicine|product|item|description|particulars)\b.*\b(?:qty|quantity|amount|rate|price|batch)\b/i.test(line)) { inTable = true; continue; }
    if (/^(?:sub\s*total|grand\s*total|net\s*(?:amount|total)|total|round\s*off|payment|balance|thank)\b/i.test(line)) { inTable = false; continue; }
    if (/\b(?:gstin|invoice|bill\s*(?:no|number|date)|patient|doctor|address|phone|mobile|licen[cs]e|cashier|pharmacy|medical\s+store|cgst|sgst|discount)\b/i.test(line)) continue;
    const cleaned = line.replace(/^\d+[.)]?\s+/, '').trim();
    // Prefer the description column; do not import batch numbers, dates or prices.
    let medicine = cleaned.split(/\t+|\s{2,}|\|/)[0].trim();
    const strength = /\b\d+(?:\.\d+)?\s*(?:mg|mcg|\u00b5g|g|ml|iu|%)\b/i;
    const form = /\b(?:tab(?:let)?s?\.?|cap(?:sule)?s?\.?|syrup|syp\.?|suspension|cream|ointment|drops|injection|inj\.?)\b/i;
    const evidence = strength.test(medicine) || form.test(medicine);
    if (!inTable && !evidence) continue;
    medicine = medicine.replace(/\s+\b(?:dose|dosage|frequency|duration|qty|quantity|batch|exp|mrp|rate|amount)\s*[:=]?.*$/i, '').trim();
    // Flat OCR rows often collapse table columns; stop at the first isolated billing number.
    if (!/\t+|\s{2,}|\|/.test(cleaned)) medicine = medicine.replace(/\s+\d+(?:\.\d+)?\s+(?!mg\b|mcg\b|g\b|ml\b|iu\b)(?=\d|[A-Z]+\d).*$/i, '').trim();
    if (!/[a-z]{3}/i.test(medicine) || medicine.length < 3 || medicine.length > 100 || /^(?:sr|sno|hsn|date|name|item|description|particulars)\b/i.test(medicine)) continue;
    const key = medicine.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) continue;
    seen.add(key);
    // Read regimen only when explicitly labeled, never from pack size or purchased quantity.
    const field = label => line.match(new RegExp('\\b(?:' + label + ')\\s*[:=]\\s*(.+?)(?=\\s+(?:dose|dosage|frequency|duration|qty|quantity|batch|exp|mrp|rate|amount)\\s*[:=]|$)', 'i'))?.[1]?.trim() || '';
    medicines.push({ medicine, dose: field('dose|dosage'), frequency: field('frequency'), duration: field('duration') });
    if (medicines.length === 50) break;
  }
  return medicines;
}
export function mergeBillMedicines(existing, incoming) {
  const result = existing.filter(row => Object.values(row).some(value => String(value || '').trim()));
  const key = row => row.medicine.trim().toLowerCase().replace(/\s+/g, ' ');
  const seen = new Set(result.map(key));
  for (const row of incoming) if (row.medicine.trim() && !seen.has(key(row))) { result.push({ ...row }); seen.add(key(row)); }
  return result;
}

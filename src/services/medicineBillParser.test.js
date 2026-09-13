import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMedicineBill, mergeBillMedicines } from './medicineBillParser.js';
test('bill columns preserve medicine strengths without treating quantity as dose', () => {
 const rows = parseMedicineBill('ABC Medical Store\nInvoice No 123\nMedicine  Qty  Rate  Amount\n1 Amlodipine 5mg  30  5.00  150.00\n2 Dolo 650  10  2.00  20.00\nGrand Total 170.00');
 assert.deepEqual(rows, [{ medicine:'Amlodipine 5mg', dose:'', frequency:'', duration:'' }, { medicine:'Dolo 650', dose:'', frequency:'', duration:'' }]);
});
test('only explicit regimen labels fill dose, frequency and duration', () => {
 assert.deepEqual(parseMedicineBill('Amoxicillin 500 mg Dose: 1 capsule Frequency: twice daily Duration: 5 days'), [{ medicine:'Amoxicillin 500 mg', dose:'1 capsule', frequency:'twice daily', duration:'5 days' }]);
});
test('unrelated text and totals are ignored; duplicates collapse', () => {
 assert.deepEqual(parseMedicineBill('Invoice 50\nPatient Name Test\nGSTIN 456\nTotal 600'), []);
 assert.equal(parseMedicineBill('Cetirizine 10mg\nCetirizine 10mg').length, 1);
});
test('empty rows are replaced and existing dosage is never overwritten', () => {
 const original = [{ medicine:'Dolo 650', dose:'existing', frequency:'', duration:'' }, { medicine:'', dose:'', frequency:'', duration:'' }];
 const merged = mergeBillMedicines(original, [{ medicine:'dolo 650', dose:'changed', frequency:'', duration:'' }, { medicine:'Amlodipine 5mg', dose:'', frequency:'', duration:'' }]);
 assert.equal(merged.length, 2); assert.equal(merged[0].dose, 'existing'); assert.equal(original.length, 2);
});

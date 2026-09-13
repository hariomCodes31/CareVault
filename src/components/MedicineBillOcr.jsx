import { useEffect, useRef, useState } from 'react';
import { parseMedicineBill } from '../services/medicineBillParser.js';
import './MedicineBillOcr.css';

export default function MedicineBillOcr({ onImport }) {
  const input = useRef(null);
  const workerRef = useRef(null);
  const generation = useRef(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  useEffect(() => () => { generation.current++; void workerRef.current?.terminate(); }, []);
  function cancel() {
    generation.current++; void workerRef.current?.terminate(); workerRef.current = null; setBusy(false); setProgress('');
  }
  async function scan(file) {
    if (!file) return;
    setError(''); setMessage(''); setRows([]); setText('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { setError('Upload a JPG, PNG or WebP bill image up to 10 MB. For a PDF, upload a screenshot of the bill page.'); return; }
    const job = ++generation.current;
    setBusy(true); setProgress('Preparing scanner?');
    let worker;
    try {
      const { createWorker } = await import('tesseract.js');
      worker = await createWorker('eng', 1, { logger: status => { if (generation.current === job) setProgress(status.status === 'recognizing text' ? `Reading bill: ${Math.round(status.progress * 100)}%` : 'Preparing scanner?'); } });
      if (generation.current !== job) return;
      workerRef.current = worker;
      const result = await worker.recognize(file);
      if (generation.current !== job) return;
      const extracted = result.data.text || '';
      setText(extracted); setRows(parseMedicineBill(extracted));
      if (!extracted.trim()) setError('No readable text found. Try a clearer, straight photo with the full medicine table visible.');
      else setMessage('Review the extracted medicines, then use them to fill the form. Missing instructions stay blank.');
    } catch {
      if (generation.current === job) setError('Unable to scan this image. Try a clearer photo and check your internet connection for scanner files.');
    } finally {
      if (worker) await worker.terminate().catch(() => {});
      if (generation.current === job) { workerRef.current = null; setBusy(false); }
    }
  }
  return <div className="medicine-bill-ocr">
    <div><strong>Scan a medical bill</strong><p>Upload a clear bill photo to extract medicine names. Review the entries before adding them; purchase quantity is not a prescribed dose.</p></div>
    <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void scan(event.target.files?.[0]); event.target.value = ''; }} />
    <button type="button" className="ct-add-row-btn" disabled={busy} onClick={() => input.current?.click()}>Upload bill & scan</button>
    {busy && <><p role="status">{progress}</p><button type="button" onClick={cancel}>Cancel scan</button></>}
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {!busy && text && <details><summary>View / correct extracted bill text</summary><textarea aria-label="Extracted bill text" value={text} onChange={event => setText(event.target.value)} /><button type="button" onClick={() => setRows(parseMedicineBill(text))}>Extract again from this text</button></details>}
    {!busy && text && rows.length === 0 && <p>No medicine rows identified. Correct the extracted text or add medicines manually below.</p>}
    {rows.length > 0 && <div className="bill-review">
      <p><strong>Review {rows.length} extracted medicine(s)</strong></p>
      {rows.map((row, index) => <div className="bill-review-row" key={index}>
        {['medicine', 'dose', 'frequency', 'duration'].map(field => <label key={field}>{field}<input value={row[field]} onChange={event => setRows(previous => previous.map((item, i) => i === index ? { ...item, [field]: event.target.value } : item))} /></label>)}
        <button type="button" aria-label={`Remove extracted medicine ${index + 1}`} onClick={() => setRows(previous => previous.filter((_, i) => i !== index))}>Remove</button>
      </div>)}
      <button type="button" className="ct-add-row-btn" disabled={!rows.some(row => row.medicine.trim())} onClick={() => { onImport(rows.filter(row => row.medicine.trim())); setRows([]); setText(''); setMessage('Medicines filled below. Existing entries were kept; duplicate names were skipped. Review before saving the visit.'); }}>Use extracted medicines</button>
    </div>}
    <small>Image processing happens in your browser. First scan downloads English OCR files. JPG, PNG or WebP ? up to 10 MB.</small>
  </div>;
}

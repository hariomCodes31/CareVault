function sanitizeError(err) {
  if (!err) return '';
  const message = err.message || String(err);
  return message.replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb$1://<redacted>@');
}

// Retry initial connection failures; the MongoDB driver handles later reconnects.
export async function connectWithRetry(connect, { delayMs = 5000, wait = ms => new Promise(resolve => setTimeout(resolve, ms)), onRetry = () => {} } = {}) {
  for (;;) {
    try {
      return await connect();
    } catch (err) {
      console.error(`❌ MongoDB connection error: ${sanitizeError(err)}`);
      onRetry(err);
      await wait(delayMs);
    }
  }
}


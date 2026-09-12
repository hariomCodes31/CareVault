// Retry initial connection failures; the MongoDB driver handles later reconnects.
export async function connectWithRetry(connect, { delayMs = 5000, wait = ms => new Promise(resolve => setTimeout(resolve, ms)), onRetry = () => {} } = {}) {
  for (;;) {
    try { return await connect(); }
    catch { onRetry(); await wait(delayMs); }
  }
}

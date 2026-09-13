import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWithUniqueAccountId } from './config/accountId.js';
test('skips existing IDs and retries a concurrent unique-index collision', async () => {
 let n = 0; const ids = [];
 const result = await createWithUniqueAccountId('doctor', async id => { ids.push(id); if (id === 'DR2026-000002') throw Object.assign(new Error(), { code: 11000, keyPattern: { userId: 1 } }); return id; }, { candidate: () => `DR2026-${String(++n).padStart(6, '0')}`, exists: async id => id === 'DR2026-000001' });
 assert.equal(result, 'DR2026-000003'); assert.deepEqual(ids, ['DR2026-000002', 'DR2026-000003']);
});
test('doctor and patient IDs retain the login format', async () => {
 for (const role of ['doctor','patient']) { const id = await createWithUniqueAccountId(role, async id => id, { exists: async () => false }); assert.match(id, new RegExp(`^${role === 'doctor' ? 'DR' : 'CV'}[0-9]{4}-[0-9]{6}$`)); }
});
test('unrelated database errors are not retried', async () => {
 let calls = 0; await assert.rejects(createWithUniqueAccountId('patient', async () => { calls++; throw new Error('offline'); }, { exists: async () => false }), /offline/); assert.equal(calls,1);
});

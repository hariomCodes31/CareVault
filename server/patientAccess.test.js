import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import routes from './routes/patientRoutes.js';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Visit from './models/Visit.js';
import Report from './models/Report.js';
import Prescription from './models/Prescription.js';

test('patient APIs enforce patient ownership, full doctor access and token validation', async () => {
 const previous = process.env.JWT_SECRET; process.env.JWT_SECRET = 'test-only-permission-secret';
 const p1='CV2026-000001', p2='CV2026-000002', d1='DR2026-000001', d2='DR2026-000002';
 const users={ p1:{userId:p1,role:'patient'}, p2:{userId:p2,role:'patient'}, d1:{userId:d1,role:'doctor'}, d2:{userId:d2,role:'doctor'} };
 const records=[{patientId:p1,name:'Patient One',allowedDoctorIds:[d1]}, {patientId:p2,name:'Patient Two',allowedDoctorIds:[]}];
 function matches(record, q) { return q.$and ? q.$and.every(part=>matches(record,part)) : Object.entries(q).every(([key,value])=>Array.isArray(record[key]) ? record[key].includes(value) : record[key]===value); }
 const hooks=[
  mock.method(User,'findById',async id=>users[id] || null),
  mock.method(User,'exists',async q=>Object.values(users).some(u=>matches(u,q))),
  mock.method(Patient,'find',q=>({sort:async()=>records.filter(r=>matches(r,q))})),
  mock.method(Patient,'exists',async q=>records.some(r=>matches(r,q))),
  mock.method(Patient,'findOne',async q=>records.find(r=>matches(r,q)) || null),
  mock.method(Patient,'findOneAndUpdate',async(q,update)=>{
   const record=records.find(r=>matches(r,q)); if(!record)return null;
   if(update.$addToSet && !record.allowedDoctorIds.includes(update.$addToSet.allowedDoctorIds))record.allowedDoctorIds.push(update.$addToSet.allowedDoctorIds);
   if(update.$pull)record.allowedDoctorIds=record.allowedDoctorIds.filter(id=>id!==update.$pull.allowedDoctorIds);
   if(update.$set)Object.assign(record,update.$set); return record;
  }),
  ...[Visit,Report,Prescription].map(model=>mock.method(model,'find',()=>({sort:async()=>[]}))),
 ];
 const app=express();app.use(express.json());app.use('/patients',routes);
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 const base=`http://127.0.0.1:${server.address().port}`;
 const token=id=>jwt.sign({id,role:'admin',userId:p2},process.env.JWT_SECRET,{expiresIn:'1h'}); // Claims cannot override the stored account role/ID.
 async function request(id,path,method='GET',body,override) {
  const headers={'Content-Type':'application/json'};if(id)headers.Authorization=`Bearer ${override || token(id)}`;
  const res=await fetch(base+path,{method,headers,body:body?JSON.stringify(body):undefined});return {status:res.status,data:await res.json()};
 }
 try {
  assert.equal((await request(null,'/patients')).status,401);
  assert.equal((await request('p1','/patients', 'GET', null,'invalid-token')).status,401);
  assert.equal((await request('p1','/patients','GET',null,jwt.sign({id:'p1'},process.env.JWT_SECRET,{expiresIn:-1}))).status,401);
  assert.deepEqual((await request('p1','/patients')).data.patients.map(p=>p.patientId),[p1]);
  assert.equal((await request('p1',`/patients/${p1}/dashboard`)).status,200);
  assert.equal((await request('p1',`/patients/${p2}/dashboard`)).status,404);
  assert.equal((await request('d1',`/patients/${p1}/dashboard`)).status,200);
  assert.equal((await request('d2',`/patients/${p1}/dashboard`)).status,200);
  assert.deepEqual((await request('d2','/patients')).data.patients.map(p=>p.patientId),[p1,p2]);
  assert.equal((await request('d2',`/patients/${p2}/dashboard`)).status,200);
  const profile={patientId:p1,name:'Updated',dob:'12-09-2000',phone:'9876543210',allowedDoctorIds:[d2]};
  assert.equal((await request('p2','/patients/register','POST',profile)).status,403);
  assert.equal((await request('d2','/patients/register','POST',profile)).status,200);
  assert.equal((await request('p1','/patients/register','POST',profile)).status,200);
  assert.deepEqual(records[0].allowedDoctorIds,[d1]);
  assert.equal((await request('d2',`/patients/${p1}/dashboard`)).status,200);
  assert.equal((await request('d2',`/patients/${p1}/dashboard`)).status,200);
 } finally { for(const hook of hooks)hook.mock.restore(); await new Promise(resolve=>server.close(resolve)); if(previous===undefined)delete process.env.JWT_SECRET;else process.env.JWT_SECRET=previous; }
});

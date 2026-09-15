import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendDictation, createOfflineRecognition, voiceLocale } from './offlineDictation.js';
test('never starts an unsupported or cloud-only recognizer', () => {
 assert.throws(() => createOfflineRecognition(null,'hi',()=>{}),/does not support/);
 assert.throws(() => createOfflineRecognition(class {},'hi',()=>{}),/On-device/);
});
test('forces local processing and uses the selected language', () => {
 class Local { processLocally=false; }
 const recognition=createOfflineRecognition(Local,'hi',()=>{});
 assert.equal(recognition.processLocally,true); assert.equal(recognition.lang,'hi-IN');
 assert.equal(voiceLocale('en'),'en-IN'); assert.equal(voiceLocale('ta'),'ta-IN');
});
test('only final results are appended once, preserving manually typed text', () => {
 class Local { processLocally=false; }
 let text='Already typed';
 const recognition=createOfflineRecognition(Local,'en',part => {text=appendDictation(text,part);});
 const final=Object.assign([{transcript:'new words'}],{isFinal:true});
 const interim=Object.assign([{transcript:'not final'}],{isFinal:false});
 recognition.onresult({resultIndex:0,results:[final,interim]});
 recognition.onresult({resultIndex:0,results:[final,interim]});
 assert.equal(text,'Already typed new words');
 assert.equal(appendDictation('x'.repeat(1199),'more').length,1200);
});

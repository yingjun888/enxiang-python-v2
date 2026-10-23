'use strict';
const APP_VERSION='ITS_1_2A_INT_STRING_RETEACH_V2',
 SCHEMA='enxiang.python.lecture.1-2a.int-string-reteach.v2',
 KEY_V2='enxiang_its_python_1_2a_int_string_reteach_v2',
 KEY_V1='enxiang_its_python_1_2a_int_string_reteach_v1';
const $=id=>document.getElementById(id), iso=()=>new Date().toISOString(), A='ABCD';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stored=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
const oldV1AtOpen=stored(KEY_V1);
function blankGate(g){return {gate:g.gate,status:'OPEN',phase:'lesson',first:null,micro:[[],[]],microStart:[0,0],reflections:[],transfers:[],finishedAt:null,heldAt:null}}
function fresh(){return {schema:SCHEMA,version:APP_VERSION,createdAt:iso(),gatePos:0,startedAt:null,completedAt:null,stage:'intro',gates:GATES.map(blankGate),history:[],v1ExistedOnOpen:!!oldV1AtOpen,lastSaved:null}}
let S=stored(KEY_V2);
if(!S||S.version!==APP_VERSION||!Array.isArray(S.gates)||S.gates.length!==5)S=fresh();
function save(){S.lastSaved=iso();try{localStorage.setItem(KEY_V2,JSON.stringify(S))}catch(e){$('exportStatus').textContent='本機存檔失敗！請立刻分享或複製 JSON，勿關閉網頁。'}}
function work(){return S.gates[S.gatePos]}
function item(){return GATES[S.gatePos]}
function log(name,more={}){S.history.push({event:name,gate:S.gatePos<5?item().gate:null,at:iso(),...more})}
function btn(id,label,fn,cls='primary'){
 const b=document.createElement('button');b.type='button';b.id=id;b.textContent=label;b.className=cls;b.onclick=fn;return b
}
function appendControls(parent,buttons){const p=document.createElement('div');p.className='row';for(const b of buttons)p.appendChild(b);parent.appendChild(p)}
function showProgress(){
 const done=S.gates.filter(g=>g.finishedAt).length;
 $('progress').style.width=(done/5*100)+'%';
 $('stateInfo').textContent='A207 重新補教 V2｜已完成 '+done+'/5 關｜'+(S.completedAt?'全數完成（延遲驗證待測）':'保留進度；可中途匯出');
}
function showIntro(){
 S.stage='intro';save();const p=$('panel');
 p.innerHTML='<span class="tag">A207｜轉型與字串｜補教修正版 V2</span><h2>從錯誤點重新理解，不重考舊12題</h2>'+
 '<p class="notice">上次 A207 Gate2 把「轉成新的浮點值」誤判成「原字串變成浮點數」。我們先學會 <b>誰收到新值</b>，再分關練習。新五關的首次答案、解釋和補教後變式會各自記錄。</p>'+
 '<pre>s = "7.8"\nn = float(s)\nprint(type(s).__name__)  # str\n\ns = float(s)\nprint(type(s).__name__)  # float</pre>'+
 '<p><b>不同的是第二段有 s = ...，因此 s 才被重新指派。</b>原本1-2A初測、舊六連問、昨天的V1補教紀錄均不會被改寫。</p>'+
 '<p class="small">你可以中途暫停，答案會留在同一瀏覽器；如果仍不懂，系統會保留 OPEN 狀態，而不是逼你選對。</p>';
 if(oldV1AtOpen)p.innerHTML+='<p class="notice warn">已在本瀏覽器發現昨天的 V1 補教紀錄。本次會額外保留 V1 供匯出參照，但不把舊成績偽裝成 V2 的首次答題。</p>';
 if(S.startedAt)p.appendChild(btn('resume','接續尚未完成的補教',()=>{S.stage='work';save();render()}));
 else p.appendChild(btn('begin','開始 A207 基礎補教',()=>{S.startedAt=iso();S.stage='work';save();render()}));
}
function questionHTML(q){return '<h2>'+esc(q.question)+'</h2>'+(q.code?'<pre>'+esc(q.code)+'</pre>':'')+
 q.options.map((o,i)=>'<label class="choice"><input type="radio" name="opt" value="'+i+'"><span>'+A[i]+'. '+esc(o)+'</span></label>').join('')}
function readChoice(){
 const n=document.querySelector('input[name="opt"]:checked');
 if(!n){alert('請選答案；真的不知道可以點「我不知道」。');return null}
 return Number(n.value)
}
function wantReason(){
 const reason=$('reason')?.value.trim()||'';
 if(reason.length<8){alert('第6關請先用至少8個字說明判斷理由；不懂可以直接標記不知道。');return null}
 return reason
}
function makeRecord(q,option,unknown=false,reason=''){
 return {option,optionLabel:unknown?'不懂':A[option],unknown,reason,
  key:q.key,correct:!unknown&&option===q.key,answeredAt:iso()};
}
function detail(q,r){
 const wrongNote=q.wrong&&Number.isInteger(r.option)?q.wrong[r.option]:null;
 return '<div class="notice '+(r.correct?'good':'bad')+'"><b>'+(r.correct?'本次答對':'本次尚未答對')+'</b><p>首次選擇：'+esc(r.optionLabel)+'；正解：'+A[q.key]+'（'+esc(q.options[q.key])+'）</p><p>'+esc(q.why)+'</p>'+
 (wrongNote?'<p><b>你選的選項為什麼不對：</b>'+esc(wrongNote)+'</p>':'')+
 '</div>';
}
function render(){
 showProgress();
 if(S.stage==='intro'){showIntro();return}
 if(S.completedAt){renderDone();return}
 const g=item(),w=work(),p=$('panel');
 if(w.phase==='hold'){p.innerHTML='<h2>這一關尚未學會，已保留原始答案</h2><p class="notice warn">不會因為一直重考就宣稱已掌握。可以先找老師／家長一起看解析，或重新進行步驟補教。</p>';
 p.appendChild(btn('resumeReteach','從分步驟補教繼續',()=>{w.microStart=[w.micro[0].length,w.micro[1].length];w.phase='micro';w.heldAt=null;log('resume_after_hold');save();render()}));return}
 if(w.phase==='lesson'){
  p.innerHTML='<span class="tag">A207｜第 '+g.gate+'/6 關｜'+esc(g.stage)+'</span><h2>'+esc(g.concept)+'</h2><p class="notice">'+esc(g.lesson)+'</p><pre>'+esc(g.example)+'</pre><p class="small">先理解原理，下一題是此修正版的新題，和昨天的V1題目不同。教材基準：老師 ITS Python 講義 §1-2。</p>';
  p.appendChild(btn('startGate','理解後做一題新情境',()=>{w.phase='first';log('start_gate');save();render()}));return
 }
 if(w.phase==='first'){
  p.innerHTML='<span class="tag">第 '+g.gate+' 關｜新情境第一次作答</span>'+questionHTML(g.first);
  if(g.gate===6)p.innerHTML+='<p><b>請用自己的話解釋（至少8字）</b></p><textarea id="reason" placeholder="例如：誰收到回傳的新值？"></textarea>';
  appendControls(p,[btn('submit','確定本次首次答案',()=>submitFirst(false)),
    btn('unknown','這題我不知道',()=>submitFirst(true),'')]);return
 }
 if(w.phase==='firstFeedback'){
  p.innerHTML='<span class="tag">第 '+g.gate+' 關｜首次答題解說</span>'+detail(g.first,w.first)+
  '<p class="small">'+(w.first.correct?'答對也要再做一題不同情境，不能用這一題宣布學會。':'答錯的選項與判斷理由已保留。接下來先拆成兩個微觀念，不是直接再猜另一題。')+'</p>';
  p.appendChild(btn('next','我讀過解說｜'+(w.first.correct?'進入不同情境驗證':'開始兩步補教'),()=>{
    w.phase=w.first.correct?'transfer':'micro';save();render()}));return
 }
 if(w.phase==='micro'){
  const step=w.micro[0].slice(w.microStart?.[0]||0).some(x=>x.correct)?1:0;
  if(step===1&&w.micro[1].slice(w.microStart?.[1]||0).some(x=>x.correct)){w.phase='reflect';save();render();return}
  const q=step===0?g.step1:g.step2;
  p.innerHTML='<span class="tag">第 '+g.gate+' 關｜微觀念 '+(step+1)+'/2</span><p class="notice">這是補教中的小題，可以重試；即使答對也只屬於<b>提示後練習</b>。</p>'+questionHTML(q);
  let attempt=w.micro[step].at(-1);
  if(attempt&&!attempt.correct)p.innerHTML+='<div class="notice bad"><b>剛才還沒判對。</b> '+esc(q.why)+'<p>上次選 '+esc(attempt.optionLabel)+'，這是補教不是首次測驗。再試一次，或標記仍不懂。</p></div>';
  appendControls(p,[btn('microSubmit','核對這一步',()=>submitMicro(false)),btn('microUnknown','這一步還是不懂',()=>submitMicro(true),'')]);return
 }
 if(w.phase==='reflect'){
  p.innerHTML='<span class="tag">第 '+g.gate+' 關｜自己說明</span><h2>請把這兩個觀念連起來</h2><p class="notice">'+esc(g.concept)+'</p><p>用至少8個字說明剛才學到的規則。這段理由仍需家長或老師人工確認。</p><textarea id="reflection" placeholder="例如：轉換產生新值，若沒重新指派原變數，就不會變。"></textarea>';
  p.appendChild(btn('confirmReflection','保留我的理解｜進入不同情境回測',()=>{
    const t=$('reflection').value.trim();if(t.length<8){alert('請用至少8個字說明；如果仍不懂，可以回到這關微教學。');return}
    w.reflections.push({text:t,at:iso(),reviewStatus:'PARENT_REVIEW_PENDING'});
    w.phase='transfer';log('reflection_recorded');save();render()}));return
 }
 if(w.phase==='transfer'){
  const q=g.transfer[Math.min(w.transfers.length,1)];
  p.innerHTML='<span class="tag">第 '+g.gate+' 關｜不同情境回測 '+(w.transfers.length+1)+'</span>'+
  '<p class="small">這個回測已經有前面的講解，所以即使答對，也只能算補教後通過，不是無提示獨立測驗。</p>'+questionHTML(q);
  if(g.gate===6)p.innerHTML+='<p><b>請用自己的話解釋（至少8字）</b></p><textarea id="reason" placeholder="誰被重新指派？"></textarea>';
  appendControls(p,[btn('transferSubmit','確定回測答案',()=>submitTransfer(false)),btn('transferUnknown','回測仍不知道',()=>submitTransfer(true),'')]);return
 }
 if(w.phase==='transferFeedback'){
  const r=w.transfers.at(-1),q=g.transfer[Math.min(w.transfers.length-1,1)];
  p.innerHTML='<span class="tag">第 '+g.gate+' 關｜回測結果</span>'+detail(q,r)+
  (r.correct?'<p class="notice good">這是<b>補教後回測通過</b>。'+(g.gate===6?'最後一關理由另待家長人工確認。':'')+' 仍需跨日無提示新題驗證。</p>':
    '<p class="notice warn">這一題仍有概念缺口，<b>不會直接進下一關，也不會清除錯誤紀錄</b>。你可以繼續分步補教，或先暫停請大人協助。</p>');
  if(r.correct)p.appendChild(btn('advanceGate',g.gate===6?'查看本次補教摘要':'保留證據｜進下一關',()=>{w.finishedAt=iso();w.status=g.gate===6?'REASON_REVIEW_AND_DELAYED_PENDING':'GUIDED_PASS_DELAYED_PENDING';log('gate_finished',{status:w.status});S.gatePos++;if(S.gatePos===5)S.completedAt=iso();save();render()}));
  else appendControls(p,[btn('retryMicro','繼續微教學（保留剛才錯誤）',()=>{w.microStart=[w.micro[0].length,w.micro[1].length];w.phase='micro';log('repeat_micro');save();render()}),btn('holdGate','暫停本關，保留不懂',()=>{w.phase='hold';w.heldAt=iso();w.status='OPEN_NEEDS_RETEACHING';log('hold_open');save();render()},'')]);
  return
 }
}
function submitFirst(unknown){
 const w=work(),g=item();if(w.phase!=='first'||w.first)return;
 const v=unknown?-1:readChoice();if(v===null)return;
 const reason=unknown?'':g.gate===6?wantReason():'';if(reason===null)return;
 w.first=makeRecord(g.first,v,unknown,reason);w.phase='firstFeedback';log('first_attempt',{correct:w.first.correct,unknown});save();render();
}
function submitMicro(unknown){
 const w=work(),g=item();if(w.phase!=='micro')return;
 const step=w.micro[0].slice(w.microStart?.[0]||0).some(x=>x.correct)?1:0,q=step===0?g.step1:g.step2;
 const v=unknown?-1:readChoice();if(v===null)return;
 const r=makeRecord(q,v,unknown);w.micro[step].push(r);log('micro_attempt',{step,correct:r.correct,unknown});
 if(r.correct){w.phase=w.micro[1].slice(w.microStart?.[1]||0).some(x=>x.correct)?'reflect':'micro';}
 // A wrong response remains visible as a teaching step, not an independent fail.
 save();render();
}
function submitTransfer(unknown){
 const w=work(),g=item();if(w.phase!=='transfer')return;
 const q=g.transfer[Math.min(w.transfers.length,1)];
 const v=unknown?-1:readChoice();if(v===null)return;
 const reason=unknown?'':g.gate===6?wantReason():'';if(reason===null)return;
 const r=makeRecord(q,v,unknown,reason);w.transfers.push(r);w.status=r.correct?'TRANSFER_GUIDED_PASS_NOT_MASTERED':'OPEN_NEEDS_RETEACHING';w.phase='transferFeedback';
 log('transfer_attempt',{correct:r.correct,unknown,attempt:w.transfers.length});save();render();
}
function renderDone(){
 const p=$('panel');
 const passed=S.gates.filter(x=>!!x.finishedAt).length;
 p.innerHTML='<h2>本次A207重新補教完成</h2><p>5關完成：'+passed+'/5</p>'+
 '<p class="notice">本次是「補教後學習證據」，不是獨立無提示成績。第6關學生理由仍需家長人工確認；1～3天後需獨立新題。</p>'+
 '<p>請從下方分享或匯出完整V2 JSON；原V1也會另外包含在匯出附件資料內（若同一瀏覽器有留存）。</p>';
}
function payload(){
 const old=stored(KEY_V1);
 return {schema:SCHEMA,version:APP_VERSION,generatedAt:iso(),policy:'NO_AUTOMATIC_MASTERY',
  originalCandidateVersion:'ITS_1_2A_INT_STRING_RETEACH_V1',
  v1SnapshotFromSameBrowser:old?JSON.parse(JSON.stringify(old)):null,
  v1AvailableInThisBrowser:!!old,
  upstreamOriginalGate1Note:'Private learning Git A207 diagnostic records Gate1 PASS; not an automatically verified local V2 answer',
  v2:JSON.parse(JSON.stringify(S)),
  metrics:{gatesCompleted:S.gates.filter(x=>!!x.finishedAt).length,totalGates:5,
    firstCorrect:S.gates.filter(x=>x.first?.correct).length,firstWrongOrUnknown:S.gates.filter(x=>x.first&&!x.first.correct).length,
    promptedTransferPass:S.gates.filter(x=>x.transfers.some(t=>t.correct)).length,openGates:S.gates.filter(x=>!x.finishedAt).map(x=>x.gate),
    reasonRequiresParentReview:S.gates.some(x=>x.gate===6&&x.first?.reason)},
  mastery:'NOT_MASTERED_DELAYED_PENDING'};
}
function exportText(){return JSON.stringify(payload(),null,2)}
function exportFilename(){return 'enxiang_1-2A_A207_reteach_V2_'+new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'})+'.json'}
function statusText(t){$('exportStatus').textContent=t}
function showRaw(){const el=$('raw');el.value=exportText();el.classList.remove('hide');statusText('已顯示完整JSON；若下載失敗，可長按全選複製。')}
function makeFile(){return new File([exportText()],exportFilename(),{type:'application/json'})}
function canShare(){
 try{return typeof File==='function'&&typeof navigator!=='undefined'&&typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:[makeFile()]})}catch(e){return false}
}
function share(){
 if(canShare()){
  try{const result=navigator.share({files:[makeFile()],title:'恩翔1-2A A207 V2補教紀錄'});
   statusText('已要求開啟iPhone分享選單；請選「儲存到檔案」並實際確認。');
   Promise.resolve(result).then(()=>statusText('系統分享程序已返回；請檢查「檔案」App。'))
    .catch(e=>statusText(e?.name==='AbortError'?'已取消分享，紀錄仍保留。':'分享未完成，請改用複製或顯示原文。'));
   return}catch(e){}
 }
 showRaw();statusText('這個瀏覽器不支援檔案分享；已顯示JSON原文，可以複製或一般下載。')
}
function download(){
 let url;try{url=URL.createObjectURL(new Blob([exportText()],{type:'application/json;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=exportFilename();document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),120000);statusText('已要求瀏覽器下載；如無反應，請用iPhone分享或複製JSON。');}
 catch(e){if(url)URL.revokeObjectURL(url);showRaw();statusText('瀏覽器下載失敗，已顯示原文。')}
}
function fallbackCopy(){
 showRaw();$('raw').focus();$('raw').select();
 try{if(document.execCommand?.('copy')){statusText('已複製JSON，請貼給家長。');return}}catch(e){}
 statusText('複製受限制，請在原文框長按→全選→複製。')
}
function copy(){
 const str=exportText();
 if(navigator.clipboard?.writeText){
  try{Promise.resolve(navigator.clipboard.writeText(str)).then(()=>statusText('已複製完整JSON，可貼給家長。')).catch(fallbackCopy);return}catch(e){}
 }
 fallbackCopy()
}
$('share').onclick=share;$('download').onclick=download;$('copy').onclick=copy;$('show').onclick=showRaw;
save();render();

/* 1-1A app, first answers immutable and prior ITS V4 storage untouched. */

const STORE='enxiang_its_python_teacher_1_1a_v1', VERSION='ITS_1_1A_FOUNDATION_V1';
const $=id=>document.getElementById(id), abc="ABCD", iso=()=>new Date().toISOString();
const escapeHTML=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const initial=()=>({version:VERSION,createdAt:iso(),lessonSeenAt:null,stage:"lesson",answers:{},submittedAt:null,review:{},work:{},activeBank:null,updatedAt:iso()});
let S;try{S=JSON.parse(localStorage.getItem(STORE)||"null")}catch(e){S=null}
if(!S||S.version!==VERSION||!S.answers||!S.review||!S.work)S=initial();
let activeQ=null,tick=null,gateTick=null;
function save(){S.updatedAt=iso();localStorage.setItem(STORE,JSON.stringify(S))}
function show(id){for(const k of ["lesson","quiz","review","topics","gate","summary"])$(k).classList.toggle("hide",k!==id);S.stage=id;save()}
function sumTime(){if(tick!==null&&activeQ){const r=S.answers[activeQ];if(r&&!r.submittedAt)r.seconds=Math.round((r.seconds+(Date.now()-tick)/1000)*1000)/1000;tick=null;save()}}
function gateSpend(){
 if(gateTick!==null&&S.stage==="gate"&&S.activeBank){
  const w=S.work[S.activeBank],r=w?.responses[gatePosition(w)];
  if(r&&!r.submittedAt){r.seconds=Math.round(((r.seconds||0)+(Date.now()-gateTick)/1000)*1000)/1000;}
  gateTick=null;save();
 }
}
document.addEventListener("visibilitychange",()=>{
 if(document.hidden){sumTime();gateSpend();}
 else{
  if(S.stage==="quiz"&&activeQ&&tick===null)tick=Date.now();
  if(S.stage==="gate"&&S.activeBank&&gateTick===null){const w=S.work[S.activeBank],r=w?.responses[gatePosition(w)];if(r&&!r.submittedAt)gateTick=Date.now();}
 }
});
window.addEventListener("pagehide",()=>{sumTime();gateSpend()});
function createAnswer(q){return S.answers[q.id]||(S.answers[q.id]={choice:null,marks:{},unknown:null,seconds:0,submittedAt:null})}
function isCorrect(q,r){if(!r||r.unknown||!r.submittedAt)return false;if(q.kind==="multi")return [0,1,2,3].every(i=>r.marks?.[i]===q.answer.includes(i));return r.choice===q.answer[0]}
function answerLabel(q,r){if(r?.unknown)return ({english:"題意英文看不懂",concept:"不知道指令或觀念",trace:"知道指令但不會追結果"})[r.unknown];if(q.kind==="multi")return [0,1,2,3].filter(i=>r.marks[i]===true).map(i=>abc[i]).join("+")||"未選";return Number.isInteger(r?.choice)?abc[r.choice]:"未選"}
function nextQuestion(){return QUESTIONS.findIndex(q=>!S.answers[q.id]?.submittedAt)}
function begin(){S.lessonSeenAt=S.lessonSeenAt||iso();save();renderQuiz()}
function renderQuiz(){
 sumTime();const index=nextQuestion();if(index<0){submitRound();return}
 const q=QUESTIONS[index],r=createAnswer(q);show("quiz");activeQ=q.id;tick=Date.now();
 $("qStep").textContent="初測第 "+(index+1)+" / 12 題";
 $("qZh").textContent=q.zh;$("qEn").textContent=q.en;
 $("qCode").textContent=q.code||"";$("qCode").classList.toggle("hide",!q.code);
 const el=$("qChoices");
 if(q.kind==="multi"){
  el.innerHTML=q.options.map((o,i)=>'<div class="choice"><b>'+abc[i]+'</b> <span>'+escapeHTML(o)+'</span><div class="tf">'+[true,false].map(v=>'<label><input type="radio" name="tf'+i+'" value="'+v+'" '+(r.marks[i]===v?"checked":"")+'> '+(v?"True":"False")+'</label>').join("")+'</div></div>').join("");
  el.querySelectorAll("input").forEach(inp=>inp.addEventListener("change",()=>{r.marks[+inp.name.slice(2)]=inp.value==="true";r.unknown=null;save()}));
 } else {
  el.innerHTML=q.options.map((o,i)=>'<label class="choice"><input type="radio" name="qChoose" value="'+i+'" '+(r.choice===i?"checked":"")+'> <b>'+abc[i]+'</b><span>'+escapeHTML(o)+'</span></label>').join("");
  el.querySelectorAll("input").forEach(inp=>inp.addEventListener("change",()=>{r.choice=+inp.value;r.unknown=null;save()}));
 }
 window.scrollTo?.(0,0);
}
function commitQuestion(unknown=null){
 const index=nextQuestion();if(index<0)return;
 const q=QUESTIONS[index],r=createAnswer(q);
 if(r.submittedAt)return;
 if(unknown){r.choice=null;r.marks={};r.unknown=unknown}
 else if(q.kind==="multi"&&![0,1,2,3].every(i=>typeof r.marks[i]==="boolean")){alert("複選必須對A、B、C、D各自判斷True/False；或選擇不懂。");return}
 else if(q.kind!=="multi"&&!Number.isInteger(r.choice)){alert("請先選一個答案，或選擇不懂。");return}
 sumTime();r.submittedAt=iso();r.correct=isCorrectAfter(q,r);save();
 if(nextQuestion()<0)submitRound();else renderQuiz();
}
function isCorrectAfter(q,r){if(r.unknown)return false;if(q.kind==="multi")return [0,1,2,3].every(i=>r.marks[i]===q.answer.includes(i));return r.choice===q.answer[0]}
function submitRound(){sumTime();S.submittedAt=S.submittedAt||iso();save();renderReview()}
function reviewOrder(){return [...QUESTIONS].sort((a,b)=>Number(isCorrect(a,S.answers[a.id]))-Number(isCorrect(b,S.answers[b.id]))).map(q=>q.id)}
function isReviewDone(){return !!S.submittedAt&&QUESTIONS.every(q=>!!S.review[q.id]?.confirmedAt)}
function openReviewId(){return reviewOrder().find(id=>!S.review[id]?.confirmedAt)}
function renderReview(){
 if(!S.submittedAt){renderQuiz();return}const id=openReviewId();if(!id){renderTopics();return}
 const q=QUESTIONS.find(v=>v.id===id),r=S.answers[id],good=isCorrect(q,r);
 show("review");$("rStep").textContent="必經逐題訂正｜"+(reviewOrder().filter(id=>S.review[id]?.confirmedAt).length+1)+" / 12 題";
 $("rZh").textContent=q.zh;$("rCode").textContent=q.code||"";$("rCode").classList.toggle("hide",!q.code);
 $("rAnswer").className="review "+(good?"good":"bad");
 $("rAnswer").innerHTML="<b>首次"+(good?"答對":"答錯／不懂")+"</b><br>原回答："+escapeHTML(answerLabel(q,r))+"<br>標準答案："+q.answer.map(i=>abc[i]).join("+")+"<br><b>解析：</b>"+escapeHTML(q.explain)+"<br><small>核對題目不代表已經掌握。</small>";
 document.querySelectorAll('input[name="rStatus"]').forEach(i=>i.checked=false);
 $("rNote").value="";$("rRead").checked=false;$("rSubmit").disabled=true;window.scrollTo?.(0,0);
}
function reviewReady(){
 const id=openReviewId();if(!id)return false;
 const q=QUESTIONS.find(x=>x.id===id),selection=document.querySelector('input[name="rStatus"]:checked')?.value;
 return !!$("rRead").checked&&!!selection&&(selection==="unclear"||isCorrect(q,S.answers[id])||$("rNote").value.trim().length>=5);
}
function checkReview(){$("rSubmit").disabled=!reviewReady()}
function commitReview(){if(!reviewReady())return;const id=openReviewId();S.review[id]={understanding:document.querySelector('input[name="rStatus"]:checked').value,note:$("rNote").value.trim(),confirmedAt:iso()};save();renderReview()}
function missedTopics(){return Object.fromEntries(Object.keys(BANKS).map(key=>[key,QUESTIONS.filter(q=>q.topic===key&&!isCorrect(q,S.answers[q.id])).map(q=>q.id)]))}
function createWork(key){return S.work[key]||(S.work[key]={originIds:missedTopics()[key],responses:{},finishedAt:null,createdAt:iso()})}
function gatePosition(work){for(let i=0;i<6;i++)if(!work.responses[i]?.advancedAt)return i;return 5}
function renderTopics(){
 if(!isReviewDone()){renderReview();return}
 S.activeBank=null;show("topics");
 $("tStat").innerHTML='<div class="stat">首次正確<strong>'+QUESTIONS.filter(q=>isCorrect(q,S.answers[q.id])).length+'/12</strong></div><div class="stat">完成訂正<strong>12/12</strong></div><div class="stat">已掌握關帳<strong>0</strong></div>';
 const misses=missedTopics();
 $("tList").innerHTML=Object.entries(BANKS).map(([key,b])=>{
 const w=S.work[key],done=Object.values(w?.responses||{}).filter(r=>r.submittedAt).length;
 return '<div class="topic"><h3>'+escapeHTML(b.name)+'</h3><small>'+escapeHTML(b.reference)+'</small><p>'+(misses[key].length?'首次未答對：'+misses[key].join("、"):"這次沒有錯題：不強迫重練")+'</p><p class="small">六連問 '+done+'/6，'+(w?.finishedAt?"已完成，待延遲回測":"待完成")+'</p>'+(misses[key].length||w?'<button class="primary" data-topic="'+key+'">'+(w?.finishedAt?"查看結果":done?"接續六連問":"開始六連問")+'</button>':"")+'</div>'
 }).join("");
 $("tList").querySelectorAll("[data-topic]").forEach(button=>button.onclick=()=>openGate(button.dataset.topic));
}
function openGate(key){
 if(!isReviewDone()){renderReview();return}if(!BANKS[key])return;
 S.activeBank=key;const w=createWork(key);save();
 if(w.finishedAt){renderSummary();return}renderGate();
}
function gateReady(){
 const w=S.work[S.activeBank],i=gatePosition(w),r=w?.responses[i];if(!r?.submittedAt)return false;
 if(r.correct)return true;
 return !!r.ackAt&&(i>1||String(r.micro||"").trim().length>=5);
}
function checkGate(){$("gNext").disabled=!gateReady()}
function renderGate(){
 if(!isReviewDone()){renderReview();return}
 const key=S.activeBank;if(!key||!BANKS[key]){renderTopics();return}
 const w=createWork(key);if(w.finishedAt){renderSummary();return}
 const i=gatePosition(w),q=BANKS[key].items[i],r=w.responses[i]||(w.responses[i]={choice:null,unknown:null,reason:"",micro:"",submittedAt:null,correct:false,ackAt:null,advancedAt:null});
 gateSpend();show("gate");gateTick=r.submittedAt?null:Date.now();$("gStep").textContent=BANKS[key].name+"｜第 "+(i+1)+" / 6 關";
 $("gZh").textContent=["① 名詞本義","② 操作對象與狀態","③ 直接應用","④ 條件改變","⑤ 跨概念連結","⑥ 陷阱與理由"][i]+"： "+q.zh;
 $("gCode").textContent=q.code||"";$("gCode").classList.toggle("hide",!q.code);
 $("gChoices").innerHTML=q.options.map((o,j)=>'<label class="choice"><input type="radio" name="gChoice" value="'+j+'" '+(r.choice===j?"checked":"")+(r.submittedAt?" disabled":"")+'> <b>'+abc[j]+'</b><span>'+escapeHTML(o)+'</span></label>').join("");
 $("gChoices").querySelectorAll("input").forEach(el=>el.onchange=()=>{r.choice=+el.value;r.unknown=null;save()});
 $("gReasonWrap").classList.toggle("hide",i!==5);$("gReason").value=r.reason;$("gReason").disabled=!!r.submittedAt;$("gReason").oninput=()=>{r.reason=$("gReason").value;save()};
 $("gUnknown").classList.toggle("hide",!!r.submittedAt);$("gSubmit").classList.toggle("hide",!!r.submittedAt);$("gNext").classList.toggle("hide",!r.submittedAt);
 $("gNext").textContent=i===5?"完成本概念六連問":"確認並進入下一關";
 $("gFeedback").classList.toggle("hide",!r.submittedAt);$("gReteach").classList.toggle("hide",!r.submittedAt||r.correct);
 if(r.submittedAt){$("gFeedback").className="review "+(r.correct?"good":"bad");
 $("gFeedback").innerHTML="<b>"+(r.correct?"首次答對":"首次答錯／不知道")+"</b><br>原答："+(r.unknown?"明確標記不懂":abc[r.choice]||"未選")+"<br>正解："+abc[q.answer[0]]+"<br>微教學："+escapeHTML(q.explain)}
 $("gMicro").value=r.micro;$("gMicro").oninput=()=>{r.micro=$("gMicro").value;save();checkGate()};
 $("gAck").checked=!!r.ackAt;$("gAck").onchange=()=>{r.ackAt=$("gAck").checked?iso():null;save();checkGate()};
 checkGate();save();window.scrollTo?.(0,0);
}
function submitGate(unknown=false){
 const key=S.activeBank;if(!key)return;const w=createWork(key),i=gatePosition(w),q=BANKS[key].items[i],r=w.responses[i];if(!r||r.submittedAt)return;
 if(!unknown&&!Number.isInteger(r.choice)){alert("先選答案，或標記這關不懂。");return}
 if(!unknown&&i===5&&r.reason.trim().length<5){alert("第6關請先寫至少5字判斷理由。");return}
 gateSpend();r.unknown=unknown?"concept":null;r.submittedAt=iso();r.correct=!unknown&&r.choice===q.answer[0];save();renderGate();
}
function nextGate(){
 if(!gateReady())return;const key=S.activeBank,w=S.work[key],i=gatePosition(w);
 w.responses[i].advancedAt=iso();if(i===5){w.finishedAt=iso();save();renderSummary()}else{save();renderGate()}
}
function renderSummary(){
 if(!S.submittedAt){renderQuiz();return}
 show("summary");const good=QUESTIONS.filter(q=>isCorrect(q,S.answers[q.id])).length;
 $("sumStats").innerHTML='<div class="stat">首次答對<strong>'+good+'/12</strong></div><div class="stat">逐題訂正<strong>'+QUESTIONS.filter(q=>!!S.review[q.id]?.confirmedAt).length+'/12</strong></div><div class="stat">完成六關概念<strong>'+Object.values(S.work).filter(w=>w.finishedAt).length+'</strong></div>';
 $("sumBody").innerHTML=Object.entries(BANKS).map(([key,b])=>{const w=S.work[key],rs=Object.values(w?.responses||{});return '<div class="topic"><b>'+escapeHTML(b.name)+'</b>：'+(w?rs.filter(r=>r.submittedAt).length+'/6關，首次通過'+rs.filter(r=>r.correct).length+'關':'尚未啟用')+'｜無提示延遲驗證待做</div>'}).join("");
}
function snapshot(){
 const misses=missedTopics();
 return {schema:"enxiang.python.lecture.1-1a.foundations.v1",version:VERSION,source:"ITS_Python重點講義 §1-1（PDF第3–4頁）",createdAt:S.createdAt,lessonSeenAt:S.lessonSeenAt,firstSubmittedAt:S.submittedAt,exportedAt:iso(),answers:QUESTIONS.map(q=>({id:q.id,concept:q.topic,kind:q.kind||"single",standardAnswer:q.answer,initialResponse:S.answers[q.id]||null,initialCorrect:isCorrect(q,S.answers[q.id]),review:S.review[q.id]||null})),sixGates:Object.fromEntries(Object.entries(BANKS).map(([k,b])=>[k,{concept:b.name,sourceMisses:misses[k],work:S.work[k]||null}])),metrics:{answered:QUESTIONS.filter(q=>!!S.answers[q.id]?.submittedAt).length,correct:QUESTIONS.filter(q=>isCorrect(q,S.answers[q.id])).length,reviewed:QUESTIONS.filter(q=>!!S.review[q.id]?.confirmedAt).length},mastery:"DELAYED_PENDING_NO_AUTOCLOSURE"};
}
function exportJSON(){
 const text=JSON.stringify(snapshot(),null,2),blob=new Blob([text],{type:"application/json;charset=utf-8"}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="enxiang_python_1-1A_"+iso().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
$("begin").onclick=begin;
$("qSubmit").onclick=()=>commitQuestion();
$("qUenglish").onclick=()=>commitQuestion("english");
$("qUconcept").onclick=()=>commitQuestion("concept");
$("qUtrace").onclick=()=>commitQuestion("trace");
$("rNote").oninput=checkReview;$("rRead").onchange=checkReview;
document.querySelectorAll('input[name="rStatus"]').forEach(i=>i.onchange=checkReview);
$("rSubmit").onclick=commitReview;$("gSubmit").onclick=()=>submitGate(false);
$("gUnknown").onclick=()=>submitGate(true);$("gNext").onclick=nextGate;
$("gHome").onclick=()=>{gateSpend();renderTopics()};$("showSummary").onclick=renderSummary;
$("backTopics").onclick=renderTopics;$("export1").onclick=exportJSON;$("export2").onclick=exportJSON;
if(!S.lessonSeenAt)show("lesson");
else if(!S.submittedAt)renderQuiz();
else if(!isReviewDone())renderReview();
else if(S.stage==="gate"&&S.activeBank&&!S.work[S.activeBank]?.finishedAt)renderGate();
else if(S.stage==="summary")renderSummary();
else renderTopics();

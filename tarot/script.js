/* ========= Config ========= */
const API_BASE = (window.__API_BASE && window.__API_BASE.replace(/\/+$/, "")) || "/api";

/* ========= Cards ========= */
const ALL_CARDS = [
  "0 - The Fool","I - The Magician","II - The High Priestess","III - The Empress",
  "IV - The Emperor","V - The Hierophant","VI - The Lovers","VII - The Chariot",
  "VIII - Strength","IX - The Hermit","X - Wheel of Fortune","XI - Justice",
  "XII - The Hanged Man","XIII - Death","XIV - Temperance","XV - The Devil",
  "XVI - The Tower","XVII - The Star","XVIII - The Moon","XIX - The Sun",
  "XX - Judgement","XXI - The World",
  "Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands",
  "Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands",
  "Page of Wands","Knight of Wands","Queen of Wands","King of Wands",
  "Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups",
  "Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups",
  "Page of Cups","Knight of Cups","Queen of Cups","King of Cups",
  "Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords",
  "Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords",
  "Page of Swords","Knight of Swords","Queen of Swords","King of Swords",
  "Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles","Five of Pentacles",
  "Six of Pentacles","Seven of Pentacles","Eight of Pentacles","Nine of Pentacles","Ten of Pentacles",
  "Page of Pentacles","Knight of Pentacles","Queen of Pentacles","King of Pentacles"
];

/* Sacred-texts mapping -> filename */
const IMG_BASE = "https://www.sacred-texts.com/tarot/pkt/img/";
const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
const pad2 = n => String(n).padStart(2,"0");
function romanToInt(roman){ if(roman==="0") return 0; let s=roman.replace(/\s+/g,'').toUpperCase(), t=0, p=0; for(let i=s.length-1;i>=0;i--){ let n=romanMap[s[i]]||0; t+= n<p? -n:n; p=n; } return t; }
function cardToFilename(name){
  if (name.includes("-")) { // Major
    const idx = romanToInt(name.split("-")[0].trim());
    return `ar${pad2(idx)}`;
  }
  const m = name.match(/^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)$/i);
  if(!m) return null;
  const rank = m[1].toLowerCase(), suit = m[2].toLowerCase();
  const suitCode = {wands:"wa", cups:"cu", swords:"sw", pentacles:"pe"}[suit];
  const rankCode = ({
    ace:"ac", page:"pa", knight:"kn", queen:"qu", king:"ki",
    two:"02", three:"03", four:"04", five:"05", six:"06",
    seven:"07", eight:"08", nine:"09", ten:"10"
  })[rank];
  return `${suitCode}${rankCode}`;
}
const cardImgUrl = name => `${IMG_BASE}${cardToFilename(name)}.jpg`;

/* ========= State ========= */
let deck=[], current=[], deepRounds=[], history=[];
let spreadCount=1;

/* ========= DOM ========= */
const $ = s => document.querySelector(s); const $$ = s => document.querySelectorAll(s);

const bigCard = $("#big-card"), bigImg=$("#big-card-img"), bigTitle=$("#big-card-title"), currentRow=$("#current-row");
const msg=$("#msg");

const drawBtn=$("#draw-btn"), completeBtn=$("#complete-btn"), deepenBtn=$("#deepen-btn"), mergeBtn=$("#merge-btn"), newBtn=$("#new-spread-btn");
const askBtn=$("#ask-ai-btn");
const askLabel = askBtn.querySelector(".btn-label");
const askLoading = askBtn.querySelector(".btn-loading");

const manualBox=$("#manual-box"), guidedBox=$("#guided-box");
const question=$("#question"), topic=$("#topic"), timeframe=$("#timeframe"), extra=$("#extra");

const aiLoading=$("#ai-loading"), aiCards=$("#ai-cards"), aiCardsRow=$("#ai-cards-row"), aiOverall=$("#ai-overall"), aiNext=$("#ai-next"), overallText=$("#overall-text"), nextText=$("#next-text");

const historyWrap=$("#history"), modal=$("#history-modal"), modalContent=$("#modal-content");
$("#close-modal").addEventListener("click", ()=>modal.close());

/* ========= Utils ========= */
const toast=(t,type="info")=>{ msg.textContent=t; msg.className=`msg ${type}`; msg.classList.remove("hidden"); setTimeout(()=>msg.classList.add("hidden"),2600); };
const shuffle=a=>{ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
const ts=()=>new Date().toLocaleString("vi-VN",{hour12:false});
function setBtnLoading(btn,isLoading){
  if(isLoading){ btn.disabled=true; askLabel.classList.add("hidden"); askLoading.classList.remove("hidden"); }
  else { btn.disabled=false; askLabel.classList.remove("hidden"); askLoading.classList.add("hidden"); }
}

/* ========= Deck & UI ========= */
function resetDeck(){ deck = shuffle([...ALL_CARDS]); }
function refreshBigCard(name){
  bigCard.classList.remove("flip");
  if(!name){
    bigImg.classList.add("hidden"); bigTitle.classList.add("hidden");
    bigCard.querySelector(".card-back").classList.remove("hidden"); return;
  }
  bigCard.querySelector(".card-back").classList.add("hidden");
  bigImg.src = cardImgUrl(name); bigImg.alt=name; bigImg.classList.remove("hidden");
  bigTitle.textContent = name; bigTitle.classList.remove("hidden");
  // flip anim
  void bigCard.offsetWidth; bigCard.classList.add("flip");
}
function renderCurrentRow(){
  currentRow.innerHTML="";
  current.forEach((name, i)=>{
    const d=document.createElement("div"); d.className="card"; d.style.animationDelay = `${i*60}ms`;
    const img=document.createElement("img"); img.src=cardImgUrl(name); img.alt=name;
    const cap=document.createElement("span"); cap.textContent=name;
    d.append(img,cap); currentRow.appendChild(d);
  });
}
function updateButtons(){
  drawBtn.disabled = current.length >= spreadCount;
  completeBtn.disabled = current.length !== spreadCount;
  askBtn.disabled = current.length !== spreadCount;
  deepenBtn.disabled = true; // mở sau khi có AI
  mergeBtn.disabled = deepRounds.length < 2;
  newBtn.disabled = history.length===0 && deepRounds.length===0 && current.length===0;
}

/* ========= AI ========= */
function getUserQuestion(){
  const type = (document.querySelector('input[name="q-type"]:checked')?.value)||"manual";
  if(type==="manual") return (question.value||"").trim();
  const parts=[]; if(topic.value) parts.push(`Chủ đề: ${topic.value}.`);
  if(timeframe.value) parts.push(`Thời gian: ${timeframe.value}.`);
  if((extra.value||"").trim()) parts.push(`Câu hỏi: ${extra.value.trim()}.`);
  return parts.join(" ");
}
function showAiPanels(data){
  aiCardsRow.innerHTML="";
  if(Array.isArray(data.cardInterpretations)&&data.cardInterpretations.length){
    aiCards.classList.remove("hidden");
    data.cardInterpretations.forEach(ci=>{
      const box=document.createElement("div");
      box.className="ai-item"; box.innerHTML=`<h4 class="font-semibold mb-1">${ci.cardName}</h4><p>${ci.interpretation}</p>`;
      aiCardsRow.appendChild(box);
    });
  } else aiCards.classList.add("hidden");
  overallText.textContent=data.overallInterpretation||""; aiOverall.classList.remove("hidden");
  nextText.textContent=data.nextStepsSuggestion||""; aiNext.classList.remove("hidden");
}
async function askAI(){
  const q=getUserQuestion(); if(!q){ toast("Vui lòng nhập/chọn câu hỏi.","error"); return; }
  aiLoading.classList.remove("hidden"); setBtnLoading(askBtn,true);

  const controller = new AbortController();
  const timeoutId = setTimeout(()=>controller.abort(), 30000); // 30s

  try{
    const res=await fetch(`${API_BASE}/ai-reading`,{
      method:"POST",
      headers:{ "Content-Type":"application/json", "Accept":"application/json" },
      body: JSON.stringify({ cards:[...current], question:q, meta:{ spreadCount, round: deepRounds.length+1 } }),
      signal: controller.signal
    });

    const raw=await res.text();
    let data;
    try{ data = JSON.parse(raw); }
    catch{ throw new Error(`Phản hồi không phải JSON (status ${res.status}). Snippet: ${raw.slice(0,120)}`); }

    if(!res.ok) throw new Error(data?.error||`HTTP ${res.status}`);
    showAiPanels(data);
    deepRounds.push({ cards:[...current], ai:data });
    deepenBtn.disabled=false; mergeBtn.disabled = deepRounds.length < 2 ? true : false;
    newBtn.disabled=false;
    toast("AI đã trả lời.","success");
  }catch(e){
    toast("Lỗi AI: "+(e.name==="AbortError"?"Hết thời gian chờ. Thử lại nhé.":e.message),"error");
  }finally{
    clearTimeout(timeoutId);
    aiLoading.classList.add("hidden");
    setBtnLoading(askBtn,false);
  }
}

/* ========= History ========= */
function saveToHistory(){
  history.push({
    timestamp: new Date().toLocaleString("vi-VN",{hour12:false}),
    spread: spreadCount,
    rounds: deepRounds.map(r=>({cards:[...r.cards], ai:r.ai}))
  });
  deepRounds=[]; // reset
}
function renderHistory(){
  historyWrap.innerHTML="";
  [...history].reverse().forEach((sp,idx)=>{
    const item=document.createElement("div"); item.className="hist-card";
    const head=document.createElement("div"); head.className="flex items-center justify-between mb-2";
    head.innerHTML=`<div class="font-semibold font-ui">Bộ ${history.length-idx}</div><div class="text-slate-400 text-sm">${sp.timestamp}</div>`;
    const row=document.createElement("div"); row.className="hist-row";
    sp.rounds.forEach(r=>r.cards.forEach(c=>{
      const t=document.createElement("div"); t.className="hist-thumb";
      t.innerHTML=`<img src="${cardImgUrl(c)}" alt="${c}">`; row.appendChild(t);
    }));
    item.append(head,row); item.addEventListener("click",()=>openModal(sp)); historyWrap.appendChild(item);
  });
}
function openModal(sp){
  modalContent.innerHTML="";
  sp.rounds.forEach((r,i)=>{
    const sec=document.createElement("div"); sec.className="modal-section";
    const head=document.createElement("div"); head.className="mb-2 flex items-center justify-between";
    head.innerHTML=`<div class="font-semibold font-ui">Lượt ${i+1}</div><div class="text-slate-400">${r.cards.length} lá</div>`;
    const thumbs=document.createElement("div"); thumbs.className="hist-row mb-3";
    r.cards.forEach(c=>{ const t=document.createElement("div"); t.className="hist-thumb"; t.innerHTML=`<img src="${cardImgUrl(c)}" alt="${c}">`; thumbs.appendChild(t); });
    const body=document.createElement("div");
    body.innerHTML=`
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="ai-item"><h4 class="font-semibold mb-1">Giải thích</h4>
          ${(r.ai?.cardInterpretations||[]).map(x=>`<p class="mb-1"><span class="font-semibold">${x.cardName}:</span> ${x.interpretation}</p>`).join("")||"<p class='text-slate-400'>Không có dữ liệu.</p>"}
        </div>
        <div class="ai-item"><h4 class="font-semibold mb-1">Tổng quan</h4><p>${r.ai?.overallInterpretation||"-"}</p></div>
        <div class="ai-item"><h4 class="font-semibold mb-1">Gợi ý</h4><p>${r.ai?.nextStepsSuggestion||"-"}</p></div>
      </div>`;
    sec.append(head,thumbs,body); modalContent.appendChild(sec);
  });
  modal.showModal();
}

/* ========= Actions ========= */
function resetTurnUI(){
  current=[]; refreshBigCard(null); renderCurrentRow();
  aiCards.classList.add("hidden"); aiOverall.classList.add("hidden"); aiNext.classList.add("hidden"); aiLoading.classList.add("hidden");
  updateButtons();
}
function drawCard(){
  if(current.length>=spreadCount) return;
  if(deck.length===0) resetDeck();
  const idx=Math.floor(Math.random()*deck.length);
  const card=deck.splice(idx,1)[0];
  current.push(card);
  refreshBigCard(card);
  renderCurrentRow();
  if(current.length===spreadCount) toast(`Đủ ${spreadCount} lá — bạn có thể hỏi AI/Hoàn tất.`, "success");
  updateButtons();
}
function deepen(){
  aiCards.classList.add("hidden"); aiOverall.classList.add("hidden"); aiNext.classList.add("hidden");
  askBtn.disabled=false; deepenBtn.disabled=true;
  toast("Hãy nhập câu hỏi tiếp theo cho bộ hiện tại.", "info");
}
function mergeSummary(){
  if(deepRounds.length<2) return;
  const lines=deepRounds.map((r,i)=>r.ai?.overallInterpretation?`• Lượt ${i+1}: ${r.ai.overallInterpretation}`:"").filter(Boolean);
  overallText.textContent = lines.slice(0,5).join(" ");
  aiOverall.classList.remove("hidden");
  toast("Đã kết hợp tổng quan.", "success");
}
function complete(){
  if(current.length!==spreadCount){ toast("Chưa đủ lá để hoàn tất.","error"); return; }
  if(deepRounds.length===0){ deepRounds.push({cards:[...current], ai:null}); }
  saveToHistory(); renderHistory(); resetTurnUI(); resetDeck();
  toast("Đã lưu vào lịch sử.", "success");
}
function newSpread(){
  // Luôn lưu lại nếu đang có bộ hiện tại, kể cả chưa hỏi AI
  if(current.length){
    if(deepRounds.length===0) deepRounds.push({cards:[...current], ai:null});
    saveToHistory(); renderHistory();
  }
  resetTurnUI(); resetDeck(); toast("Bắt đầu lượt mới!", "info");
}

/* ========= Init ========= */
document.addEventListener("DOMContentLoaded", ()=>{
  // radios: spread
  document.querySelectorAll('input[name="spread-type"]').forEach(r=>{
    r.addEventListener("change", e=>{
      spreadCount=parseInt(e.target.value,10)||1;
      resetTurnUI(); resetDeck(); toast(`Bạn đã chọn bóc ${spreadCount} lá.`, "info");
    });
  });

  // radios: question type
  document.querySelectorAll('input[name="q-type"]').forEach(r=>{
    r.addEventListener("change", e=>{
      const v=e.target.value;
      if(v==="manual"){ manualBox.classList.remove("hidden"); guidedBox.classList.add("hidden"); }
      else { guidedBox.classList.remove("hidden"); manualBox.classList.add("hidden"); }
    });
  });

  // tip chips (chèn câu hỏi mẫu)
  document.querySelectorAll(".tip-chip").forEach(chip=>{
    chip.addEventListener("click", ()=>{
      const ins = chip.getAttribute("data-insert") || "";
      const cur = (question.value||"").trim();
      question.value = cur ? (cur.endsWith("?")? `${cur} ${ins}` : `${cur}. ${ins}`) : ins;
      question.focus();
    });
  });

  // buttons
  drawBtn.addEventListener("click", drawCard);
  askBtn.addEventListener("click", askAI);
  deepenBtn.addEventListener("click", deepen);
  mergeBtn.addEventListener("click", mergeSummary);
  completeBtn.addEventListener("click", complete);
  newBtn.addEventListener("click", newSpread);

  resetDeck(); resetTurnUI();
});

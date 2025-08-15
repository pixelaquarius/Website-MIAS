// ===== Config =====
const API_BASE = (window.__API_BASE && window.__API_BASE.replace(/\/+$/, "")) || "/api";

// Map ảnh lá bài (nếu có CDN riêng thì điền ở đây). Để trống vẫn chạy (hiện tên).
const CARD_IMAGES = {}; // ví dụ: { "Page of Pentacles": "https://.../page_of_pentacles.jpg", ... }

// ===== Data =====
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
  "Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles",
  "Five of Pentacles","Six of Pentacles","Seven of Pentacles","Eight of Pentacles",
  "Nine of Pentacles","Ten of Pentacles","Page of Pentacles","Knight of Pentacles",
  "Queen of Pentacles","King of Pentacles"
];

let deck = [];
let current = [];
let numCardsToDraw = 1;
let history = []; // [{timestamp, cards, spreadType, ai?}]
let aiLast = null;

// ===== DOM =====
const drawBtn = $("#draw-btn");
const completeBtn = $("#complete-btn");
const deepenBtn = $("#deepen-btn");
const mergeBtn = $("#merge-btn");
const newBtn = $("#new-spread-btn");
const msgBox = $("#msg");

const bigCard = $("#big-card");
const bigImg = $("#big-card-img");
const bigTitle = $("#big-card-title");
const row = $("#current-row");
const historyBox = $("#history");

const askBtn = $("#ask-ai-btn");
const aiLoading = $("#ai-loading");
const aiCardsWrap = $("#ai-cards");
const aiCardsRow = $("#ai-cards-row");
const overallPanel = $("#ai-overall");
const overallText = $("#overall-text");
const nextPanel = $("#ai-next");
const nextText = $("#next-text");

const manualRadio = $$('input[name="q-type"][value="manual"]');
const guidedRadio = $$('input[name="q-type"][value="guided"]');
const manualBox = $("#manual-box");
const guidedBox = $("#guided-box");
const qInput = $("#question");
const topicSel = $("#topic");
const timeSel = $("#timeframe");
const extraInp = $("#extra");

const spreadRadios = $$all('input[name="spread-type"]');

function $(s){return document.querySelector(s);}
function $$all(s){return Array.from(document.querySelectorAll(s));}
function $$(s){return document.querySelector(s);}
function showMsg(t, type="ok"){
  msgBox.textContent = t;
  msgBox.classList.remove("hidden","ok","err");
  msgBox.classList.add(type==="ok"?"ok":"err");
}
function hideMsg(){ msgBox.classList.add("hidden"); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;}
function nowVN(){ return new Date().toLocaleString("vi-VN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}); }

// ===== Deck & Render =====
function resetDeck(){ deck = shuffle([...ALL_CARDS]); }
function resetBoard(){
  current = [];
  bigImg.classList.add("hidden");
  bigTitle.classList.add("hidden");
  $("#big-card .card-back").classList.remove("hidden");
  row.innerHTML = "";
  drawBtn.disabled = false;
  completeBtn.disabled = true;
  deepenBtn.disabled = true;
  mergeBtn.disabled = true;
  newBtn.disabled = true;
  clearAI();
}

function drawOne(){
  if(current.length >= numCardsToDraw){ showMsg(`Bạn đã bóc đủ ${numCardsToDraw} lá.`, "ok"); return; }
  if(deck.length===0) resetDeck();
  const idx = Math.floor(Math.random()*deck.length);
  const card = deck.splice(idx,1)[0];
  current.push(card);
  renderCard(card);
  renderRow();
  if(current.length===numCardsToDraw){
    drawBtn.disabled = true;
    completeBtn.disabled = false;
    deepenBtn.disabled = false;
    mergeBtn.disabled = false;
    newBtn.disabled = false;
    showMsg(`Đã đủ ${numCardsToDraw} lá. Bạn có thể “Nhận Giải Thích Từ AI”.`,"ok");
  }else{
    hideMsg();
  }
}

function renderCard(name){
  const img = CARD_IMAGES[name];
  $("#big-card .card-back").classList.add("hidden");
  if(img){
    bigImg.src = img; bigImg.alt = name; bigImg.classList.remove("hidden");
    bigTitle.textContent = name; bigTitle.classList.remove("hidden");
  }else{
    bigImg.classList.add("hidden");
    bigTitle.textContent = name; bigTitle.classList.remove("hidden");
  }
}
function renderRow(){
  row.innerHTML = "";
  current.forEach(c=>{
    const d=document.createElement("div");
    d.className="mini";
    const img=CARD_IMAGES[c];
    if(img){ d.innerHTML=`<img src="${img}" alt="${c}" />`; }
    else{ d.innerHTML=`<div style="width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center;background:#1f2937;color:#e5e7eb;font-weight:700;padding:.4rem;text-align:center">${c}</div>`; }
    row.appendChild(d);
  });
}

// ===== History =====
function pushHistory(){
  if(current.length===0) return;
  history.push({
    timestamp: nowVN(),
    cards: [...current],
    spreadType: numCardsToDraw,
    ai: aiLast ? {...aiLast} : null
  });
  renderHistory();
}
function renderHistory(){
  historyBox.innerHTML = "";
  history.slice().reverse().forEach((h, i)=>{
    const wrap = document.createElement("div");
    wrap.className = "history-card";
    wrap.innerHTML = `
      <div class="text-sm text-slate-300 mb-2">Bộ ${history.length - i} • ${h.timestamp}</div>
      <div class="history-strip">
        ${h.cards.map(c=>{
          const src=CARD_IMAGES[c];
          return `<div class="mini">${src?`<img src="${src}" alt="${c}" />`:`<div style="width:100%;height:100%;background:#1f2937"></div>`}</div>`;
        }).join("")}
      </div>`;
    wrap.addEventListener("click", ()=>openHistoryModal(history.length - i - 1));
    historyBox.appendChild(wrap);
  });
}
function openHistoryModal(index){
  const h = history[index];
  if(!h) return;
  modalContent.innerHTML = `
    <div class="text-slate-300">Thời gian: <b>${h.timestamp}</b> — Bộ ${index+1}</div>
    <div class="history-strip">
      ${h.cards.map(c=>{
        const src=CARD_IMAGES[c];
        return `<div class="mini">${src?`<img src="${src}" alt="${c}" />`:`<div style="width:100%;height:100%;background:#1f2937"></div>`}</div>`;
      }).join("")}
    </div>
    ${h.ai ? (`
      <div class="ai-panel">
        <div class="font-title sub-title">Tổng Quan</div>
        <div>${escapeHTML(h.ai.overall || "")}</div>
      </div>
      <div class="ai-panel">
        <div class="font-title sub-title">Gợi ý & Bước tiếp theo</div>
        <div>${escapeHTML(h.ai.next || "")}</div>
      </div>
      <div class="grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        ${h.ai.cards.map(it=>`
          <div class="ai-item">
            <div class="font-semibold mb-1">${escapeHTML(it.cardName)}</div>
            <div class="text-slate-300 text-sm">${escapeHTML(it.interpretation)}</div>
          </div>`).join("")}
      </div>
    `): `<div class="text-slate-400">Chưa có phần giải thích AI lưu kèm.</div>`}
  `;
  modal.showModal();
}
function escapeHTML(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ===== AI =====
function clearAI(){
  aiLast = null;
  aiCardsWrap.classList.add("hidden");
  overallPanel.classList.add("hidden");
  nextPanel.classList.add("hidden");
  aiCardsRow.innerHTML = "";
  overallText.textContent = "";
  nextText.textContent = "";
  aiLoading.classList.add("hidden");
  askBtn.classList.remove("loading");
  askBtn.disabled = false;
}
function buildUserQuestion(){
  const mode = document.querySelector('input[name="q-type"]:checked').value;
  if(mode === "manual"){
    return qInput.value.trim();
  }else{
    const t = (topicSel.value||"").trim();
    const tf = (timeSel.value||"").trim();
    const ex = (extraInp.value||"").trim();
    const parts=[];
    if(t) parts.push(`Chủ đề: ${t}.`);
    if(tf) parts.push(`Thời gian: ${tf}.`);
    if(ex) parts.push(`Câu hỏi cụ thể: ${ex}.`);
    return parts.join(" ");
  }
}

async function askAI(){
  if(current.length !== numCardsToDraw){
    showMsg(`Vui lòng bóc đủ ${numCardsToDraw} lá trước khi hỏi AI.`, "err"); return;
  }
  const question = buildUserQuestion();
  if(!question){ showMsg("Vui lòng nhập/chọn câu hỏi.", "err"); return; }

  // UI loading
  askBtn.classList.add("loading");
  askBtn.disabled = true;
  aiLoading.classList.remove("hidden");
  showMsg("Đang gọi AI…","ok");

  try{
    const payload = { cards: current, question, meta: { spreadCount: numCardsToDraw } };

    // client timeout 35s để không treo
    const controller = new AbortController();
    const t = setTimeout(()=>controller.abort(), 35000);

    const resp = await fetch(`${API_BASE}/ai-reading`, {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload), signal: controller.signal
    });
    clearTimeout(t);

    const text = await resp.text();
    let data;
    try{ data = JSON.parse(text); }
    catch{ throw new Error(`Phản hồi không phải JSON (status ${resp.status}). Snippet: ${text.slice(0,110)}...`); }

    if(!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);

    // render từ 1 lần trả lời
    const list = data.cardInterpretations || [];
    aiCardsRow.innerHTML = "";
    list.forEach(it=>{
      const div = document.createElement("div");
      div.className = "ai-item";
      div.innerHTML = `<div class="font-semibold mb-1">${escapeHTML(it.cardName||"")}</div>
      <div class="text-slate-300 text-sm">${escapeHTML(it.interpretation||"")}</div>`;
      aiCardsRow.appendChild(div);
    });
    if(list.length) aiCardsWrap.classList.remove("hidden");

    overallText.textContent = data.overallInterpretation || "";
    nextText.textContent = data.nextStepsSuggestion || "";
    if(overallText.textContent) overallPanel.classList.remove("hidden");
    if(nextText.textContent) nextPanel.classList.remove("hidden");

    aiLast = { cards: list, overall: overallText.textContent, next: nextText.textContent };
    showMsg("Đã nhận giải thích từ AI.","ok");
  }catch(err){
    showMsg(`Lỗi AI: ${err.message}`,"err");
  }finally{
    aiLoading.classList.add("hidden");
    askBtn.classList.remove("loading");
    askBtn.disabled = false;
    deepenBtn.disabled = false;
  }
}

// ===== Events =====
drawBtn.addEventListener("click", drawOne);

completeBtn.addEventListener("click", ()=>{
  if(current.length !== numCardsToDraw){ showMsg("Chưa đủ lá để hoàn tất.","err"); return; }
  pushHistory();
  resetBoard();
  resetDeck();
  showMsg("Đã lưu vào lịch sử.","ok");
});

newBtn.addEventListener("click", ()=>{
  if(current.length>0) pushHistory();
  resetBoard(); resetDeck();
  showMsg("Bắt đầu bộ mới.","ok");
});

deepenBtn.addEventListener("click", ()=>{
  askBtn.disabled = false;
  showMsg("Bạn có thể hỏi tiếp cho bộ hiện tại.","ok");
});

mergeBtn.addEventListener("click", ()=>{
  if(!aiLast){ showMsg("Hãy nhận giải thích AI trước.","err"); return; }
  const merged = `${aiLast.overall}\n— ${aiLast.next}`;
  alert(`Tổng quan ngắn:\n\n${merged}`);
});

askBtn.addEventListener("click", askAI);

// Switch manual/guided
manualRadio.addEventListener("change", ()=>{
  manualBox.classList.remove("hidden");
  guidedBox.classList.add("hidden");
});
guidedRadio.addEventListener("change", ()=>{
  manualBox.classList.add("hidden");
  guidedBox.classList.remove("hidden");
});

// Spread change
spreadRadios.forEach(r=>{
  r.addEventListener("change", ()=>{
    numCardsToDraw = parseInt(r.value,10);
    resetBoard(); resetDeck();
    showMsg(`Đã chọn bóc ${numCardsToDraw} lá.`,"ok");
  });
});

// Tip chips
document.addEventListener("click",(e)=>{
  const btn = e.target.closest(".tip-chip");
  if(!btn) return;
  const text = btn.getAttribute("data-insert")||"";
  qInput.value = text;
});

// Modal
const modal = $("#history-modal");
const modalContent = $("#modal-content");
const modalClose = $("#close-modal");
modalClose.addEventListener("click", ()=>modal.close());

// Init
resetDeck();
resetBoard();
renderHistory();

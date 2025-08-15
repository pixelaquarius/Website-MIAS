/* ==== Tarot App – UI + Logic (no framework) ==== */

/** ========= Data ========= **/
const ALL_CARDS = [
  "0 - The Fool","I - The Magician","II - The High Priestess","III - The Empress",
  "IV - The Emperor","V - The Hierophant","VI - The Lovers","VII - The Chariot",
  "VIII - Strength","IX - The Hermit","X - Wheel of Fortune","XI - Justice",
  "XII - The Hanged Man","XIII - Death","XIV - Temperance","XV - The Devil",
  "XVI - The Tower","XVII - The Star","XVIII - The Moon","XIX - The Sun",
  "XX - Judgement","XXI - The World",
  // Wands
  "Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands",
  "Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands",
  "Page of Wands","Knight of Wands","Queen of Wands","King of Wands",
  // Cups
  "Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups",
  "Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups",
  "Page of Cups","Knight of Cups","Queen of Cups","King of Cups",
  // Swords
  "Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords",
  "Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords",
  "Page of Swords","Knight of Swords","Queen of Swords","King of Swords",
  // Pentacles
  "Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles","Five of Pentacles",
  "Six of Pentacles","Seven of Pentacles","Eight of Pentacles","Nine of Pentacles","Ten of Pentacles",
  "Page of Pentacles","Knight of Pentacles","Queen of Pentacles","King of Pentacles"
];

/** Sacred-Texts URL pattern (public domain) */
/** majors: ar00..ar21; suits: wa/cu/sw/pe + 02..10, ac, pa, kn, qu, ki  */
const IMG_BASE = "https://www.sacred-texts.com/tarot/pkt/img/";

const romanMap = {I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
function romanToInt(roman){
  if(roman==="0") return 0;
  let s=roman.replace(/\s+/g,'').toUpperCase();
  let total=0, prev=0;
  for(let i=s.length-1;i>=0;i--){
    const n=romanMap[s[i]]||0;
    total += n<prev? -n : n;
    prev=n;
  }
  return total;
}

function pad2(n){ return n.toString().padStart(2,"0"); }

/** Convert human card name to sacred-texts filename */
function cardToFilename(name){
  // Major Arcana "X - Title"
  if (/^\w+/.test(name) && name.includes("-")) {
    const left = name.split("-")[0].trim();
    const n = romanToInt(left);
    return `ar${pad2(n)}`;
  }

  // Minors
  const m = name.match(/^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)$/i);
  if(!m) return null;

  const rank = m[1].toLowerCase();
  const suit = m[2].toLowerCase();
  const suitCode = {wands:'wa', cups:'cu', swords:'sw', pentacles:'pe'}[suit];
  let rankCode = "";
  switch(rank){
    case "ace":   rankCode = "ac"; break;
    case "page":  rankCode = "pa"; break;
    case "knight":rankCode = "kn"; break;
    case "queen": rankCode = "qu"; break;
    case "king":  rankCode = "ki"; break;
    default: {
      const num = {
        two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10
      }[rank];
      rankCode = pad2(num);
    }
  }
  return `${suitCode}${rankCode}`;
}

function cardImgUrl(name){
  const file = cardToFilename(name);
  return file ? `${IMG_BASE}${file}.jpg` : "";
}

/** ========= State ========= **/
let deck = [];
let current = [];      // các lá của lượt hiện tại (một vòng draw)
let deepRounds = [];   // các vòng coi sâu (một lượt có thể nhiều vòng)
let history = [];      // [{timestamp, rounds:[{cards, ai}], spread}]
let spreadCount = 1;   // 1/3/5

/** ========= UI elements ========= **/
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const bigCard = $("#big-card");
const bigImg = $("#big-card-img");
const bigTitle = $("#big-card-title");
const currentRow = $("#current-row");
const msg = $("#msg");

const drawBtn = $("#draw-btn");
const completeBtn = $("#complete-btn");
const deepenBtn = $("#deepen-btn");
const newSpreadBtn = $("#new-spread-btn");
const askAiBtn = $("#ask-ai-btn");
const mergeBtn = $("#merge-btn");

const manualBox = $("#manual-box");
const guidedBox = $("#guided-box");
const questionEl = $("#question");
const topicEl = $("#topic");
const timeframeEl = $("#timeframe");
const extraEl = $("#extra");

const aiLoading = $("#ai-loading");
const aiCards = $("#ai-cards");
const aiCardsRow = $("#ai-cards-row");
const aiOverall = $("#ai-overall");
const aiNext = $("#ai-next");
const overallText = $("#overall-text");
const nextText = $("#next-text");

const historyWrap = $("#history");
const historyModal = $("#history-modal");
const modalContent = $("#modal-content");
$("#close-modal").addEventListener("click", () => historyModal.close());

/** ========= Utils ========= **/
function toast(text, type="info"){
  msg.textContent = text;
  msg.className = `msg ${type}`;
  msg.classList.remove("hidden");
  setTimeout(()=>msg.classList.add("hidden"), 3000);
}
function shuffle(a){
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/** ========= Deck & Draw ========= **/
function resetDeck(){
  deck = shuffle([...ALL_CARDS]);
}

function refreshBigCard(name){
  if(!name){
    bigImg.classList.add("hidden");
    bigTitle.classList.add("hidden");
    bigCard.querySelector(".card-back").classList.remove("hidden");
    return;
  }
  bigCard.querySelector(".card-back").classList.add("hidden");
  bigImg.src = cardImgUrl(name);
  bigImg.alt = name;
  bigImg.classList.remove("hidden");
  bigTitle.textContent = name;
  bigTitle.classList.remove("hidden");
}

function renderCurrentRow(){
  currentRow.innerHTML = "";
  for (const name of current){
    const d = document.createElement("div");
    d.className = "card";
    const img = document.createElement("img");
    img.src = cardImgUrl(name);
    img.alt = name;
    const cap = document.createElement("span");
    cap.textContent = name;
    d.append(img, cap);
    currentRow.appendChild(d);
  }
}

function updateButtons(){
  const need = spreadCount;
  drawBtn.disabled = current.length >= need;
  completeBtn.disabled = current.length !== need;
  askAiBtn.disabled = current.length !== need;
  deepenBtn.disabled = true;   // chỉ mở sau khi có trả lời AI
  mergeBtn.disabled = deepRounds.length < 2; // cần >=2 vòng
  newSpreadBtn.disabled = history.length===0 && deepRounds.length===0 && current.length===0;
}

/** ========= AI helper ========= **/
function getUserQuestion(){
  const type = [...$$('input[name="q-type"]')].find(r=>r.checked)?.value || "manual";
  if(type === "manual"){
    return (questionEl.value||"").trim();
  }
  let parts = [];
  if (topicEl.value) parts.push(`Chủ đề: ${topicEl.value}.`);
  if (timeframeEl.value) parts.push(`Thời gian: ${timeframeEl.value}.`);
  if (extraEl.value.trim()) parts.push(`Câu hỏi: ${extraEl.value.trim()}.`);
  return parts.join(" ");
}

function showAiPanels(data){
  // cards
  aiCardsRow.innerHTML = "";
  if (Array.isArray(data.cardInterpretations)){
    aiCards.classList.remove("hidden");
    for (const item of data.cardInterpretations){
      const div = document.createElement("div");
      div.className = "ai-item";
      div.innerHTML = `<h4 class="font-semibold mb-1">${item.cardName}</h4><p>${item.interpretation}</p>`;
      aiCardsRow.appendChild(div);
    }
  } else {
    aiCards.classList.add("hidden");
  }
  // overall + next
  overallText.textContent = data.overallInterpretation || "";
  nextText.textContent = data.nextStepsSuggestion || "";
  aiOverall.classList.remove("hidden");
  aiNext.classList.remove("hidden");
}

/** ========= History ========= **/
function pushRoundToDeep(ai){
  deepRounds.push({ cards:[...current], ai });
}

function saveSpreadToHistory(){
  history.push({
    timestamp: new Date().toLocaleString("vi-VN",{hour12:false}),
    spread: spreadCount,
    rounds: deepRounds.map(r=>({cards:[...r.cards], ai:r.ai}))
  });
  deepRounds = [];
}

function renderHistory(){
  historyWrap.innerHTML = "";
  [...history].reverse().forEach((sp, idx)=>{
    const item = document.createElement("div");
    item.className = "hist-card";
    const title = document.createElement("div");
    title.className = "flex items-center justify-between mb-2";
    title.innerHTML = `<div class="font-semibold">Bộ ${history.length - idx} • ${sp.timestamp}</div><div class="text-slate-400 text-sm">${sp.rounds.length} lượt</div>`;
    const row = document.createElement("div");
    row.className = "hist-row";
    sp.rounds.forEach(r=>{
      // hiển thị mỗi vòng 3 thumb (hoặc tất cả nếu spread=5)
      r.cards.forEach(c=>{
        const t = document.createElement("div");
        t.className = "hist-thumb";
        t.innerHTML = `<img src="${cardImgUrl(c)}" alt="${c}"/>`;
        row.appendChild(t);
      });
    });
    item.append(title,row);
    item.addEventListener("click", ()=>openHistoryModal(sp));
    historyWrap.appendChild(item);
  });
}

function openHistoryModal(spread){
  modalContent.innerHTML = "";
  spread.rounds.forEach((r, i)=>{
    const sec = document.createElement("div");
    sec.className = "modal-section";
    const head = document.createElement("div");
    head.className = "mb-2 flex items-center justify-between";
    head.innerHTML = `<div class="font-semibold">Lượt ${i+1}</div><div class="text-slate-400">${r.cards.length} lá</div>`;
    const thumbs = document.createElement("div");
    thumbs.className = "hist-row mb-3";
    r.cards.forEach(c=>{
      const t = document.createElement("div");
      t.className = "hist-thumb";
      t.innerHTML = `<img src="${cardImgUrl(c)}" alt="${c}"/>`;
      thumbs.appendChild(t);
    });
    const body = document.createElement("div");
    body.innerHTML = `
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="ai-item"><h4 class="font-semibold mb-1">Giải thích từng lá</h4>
          ${(r.ai?.cardInterpretations||[]).map(x=>`<p class="mb-1"><span class="font-semibold">${x.cardName}:</span> ${x.interpretation}</p>`).join("") || "<p class='text-slate-400'>Không có dữ liệu.</p>"}
        </div>
        <div class="ai-item"><h4 class="font-semibold mb-1">Tổng quan</h4><p>${r.ai?.overallInterpretation||"-"}</p></div>
        <div class="ai-item"><h4 class="font-semibold mb-1">Gợi ý</h4><p>${r.ai?.nextStepsSuggestion||"-"}</p></div>
      </div>`;
    sec.append(head, thumbs, body);
    modalContent.appendChild(sec);
  });
  historyModal.showModal();
}

/** ========= Actions ========= **/
function resetUIForNewTurn(){
  current = [];
  refreshBigCard(null);
  renderCurrentRow();
  aiCards.classList.add("hidden");
  aiOverall.classList.add("hidden");
  aiNext.classList.add("hidden");
  aiLoading.classList.add("hidden");
  updateButtons();
}

function onDraw(){
  if (current.length >= spreadCount) return;
  if (deck.length === 0) resetDeck();
  const idx = Math.floor(Math.random() * deck.length);
  const card = deck.splice(idx,1)[0];
  current.push(card);
  refreshBigCard(card);
  renderCurrentRow();
  if (current.length === spreadCount) {
    toast(`Đủ ${spreadCount} lá — bạn có thể “Nhận Giải Thích Từ AI” hoặc “Hoàn Tất”.`,"success");
  }
  updateButtons();
}

async function onAskAI(){
  const question = getUserQuestion();
  if (!question) { toast("Vui lòng nhập/chọn câu hỏi.","error"); return; }
  aiLoading.classList.remove("hidden");
  askAiBtn.disabled = true;

  const payload = {
    cards: [...current],
    question,
    meta: { spreadCount, round: deepRounds.length + 1 }
  };

  try{
    // GỌI API VERCEL CỦA BẠN: /api/ai-reading (method POST, JSON)
    const resp = await fetch("/api/ai-reading", {
      method:"POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });

    if(!resp.ok){
      const text = await resp.text();
      throw new Error(`HTTP ${resp.status} – ${text.slice(0,80)}`);
    }
    const data = await resp.json();
    showAiPanels(data);
    pushRoundToDeep(data);        // lưu 1 vòng coi
    deepenBtn.disabled = false;   // cho phép coi sâu tiếp
    mergeBtn.disabled = deepRounds.length < 2;
    newSpreadBtn.disabled = false;
    toast("AI đã trả lời.","success");
  }catch(err){
    toast(`Lỗi AI: ${err.message}`, "error");
  }finally{
    aiLoading.classList.add("hidden");
  }
}

function onDeepen(){
  // giữ nguyên các lá của vòng hiện tại -> người dùng hỏi câu khác (manual/guided đều OK)
  aiCards.classList.add("hidden");
  aiOverall.classList.add("hidden");
  aiNext.classList.add("hidden");
  askAiBtn.disabled = false;   // cho hỏi mới trên cùng bộ
  deepenBtn.disabled = true;   // chờ trả lời tiếp theo
  toast("Hãy nhập câu hỏi tiếp theo cho bộ hiện tại.", "info");
}

function onMerge(){
  if (deepRounds.length < 2) return;
  // Gộp các tổng quan thành 4–5 dòng
  const lines = [];
  deepRounds.forEach((r,i)=>{
    const t = r.ai?.overallInterpretation || "";
    if (t) lines.push(`• Lượt ${i+1}: ${t}`);
  });
  overallText.textContent = lines.slice(0,5).join(" ");
  aiOverall.classList.remove("hidden");
  toast("Đã kết hợp tổng quan của các lần coi.", "success");
}

function onComplete(){
  if (current.length !== spreadCount) { toast("Chưa đủ lá để hoàn tất.","error"); return; }
  // nếu người dùng chưa bấm “Nhận Giải Thích Từ AI”, vẫn lưu vòng (không có ai)
  if (deepRounds.length === 0) pushRoundToDeep(null);
  saveSpreadToHistory();
  renderHistory();
  resetUIForNewTurn();
  resetDeck();
  toast("Đã lưu vào lịch sử. Bạn có thể bóc lượt mới.","success");
}

function onNewSpread(){
  // Lưu nếu còn dang dở
  if (current.length && deepRounds.length>0){
    saveSpreadToHistory();
    renderHistory();
  } else if (!history.length){
    // nếu thật sự mới: chỉ reset UI
  }
  resetUIForNewTurn();
  resetDeck();
  toast("Bắt đầu lượt mới!", "info");
}

/** ========= Events ========= **/
document.addEventListener("DOMContentLoaded", ()=>{
  // spread options
  document.querySelectorAll('input[name="spread-type"]').forEach(r=>{
    r.addEventListener("change", e=>{
      spreadCount = parseInt(e.target.value,10) || 1;
      resetUIForNewTurn();
      resetDeck();
      toast(`Bạn đã chọn bóc ${spreadCount} lá.`, "info");
    });
  });

  // guided/manual switch
  document.querySelectorAll('input[name="q-type"]').forEach(r=>{
    r.addEventListener("change", e=>{
      const val = e.target.value;
      if (val === "manual"){ manualBox.classList.remove("hidden"); guidedBox.classList.add("hidden"); }
      else { guidedBox.classList.remove("hidden"); manualBox.classList.add("hidden"); }
    });
  });

  // buttons
  drawBtn.addEventListener("click", onDraw);
  askAiBtn.addEventListener("click", onAskAI);
  deepenBtn.addEventListener("click", onDeepen);
  mergeBtn.addEventListener("click", onMerge);
  completeBtn.addEventListener("click", onComplete);
  newSpreadBtn.addEventListener("click", onNewSpread);

  // init
  resetDeck();
  resetUIForNewTurn();
});

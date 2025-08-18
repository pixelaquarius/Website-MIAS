/* ====== CẤU HÌNH  ====== */
// Nếu frontend ở GitHub Pages (miasteam.click) còn API ở Vercel,
// gọi sang domain Vercel. Nếu sau này trỏ domain về Vercel, API_BASE="" là được.
const API_BASE = ""; // để trống nếu cùng origin. Ví dụ: "https://website-mias.vercel.app"

// 78 lá bài
const ALL_CARDS = [
  "0 - The Fool","I - The Magician","II - The High Priestess","III - The Empress","IV - The Emperor","V - The Hierophant","VI - The Lovers","VII - The Chariot","VIII - Strength","IX - The Hermit","X - Wheel of Fortune","XI - Justice","XII - The Hanged Man","XIII - Death","XIV - Temperance","XV - The Devil","XVI - The Tower","XVII - The Star","XVIII - The Moon","XIX - The Sun","XX - Judgement","XXI - The World",
  "Ace of Wands","Two of Wands","Three of Wands","Four of Wands","Five of Wands","Six of Wands","Seven of Wands","Eight of Wands","Nine of Wands","Ten of Wands","Page of Wands","Knight of Wands","Queen of Wands","King of Wands",
  "Ace of Cups","Two of Cups","Three of Cups","Four of Cups","Five of Cups","Six of Cups","Seven of Cups","Eight of Cups","Nine of Cups","Ten of Cups","Page of Cups","Knight of Cups","Queen of Cups","King of Cups",
  "Ace of Swords","Two of Swords","Three of Swords","Four of Swords","Five of Swords","Six of Swords","Seven of Swords","Eight of Swords","Nine of Swords","Ten of Swords","Page of Swords","Knight of Swords","Queen of Swords","King of Swords",
  "Ace of Pentacles","Two of Pentacles","Three of Pentacles","Four of Pentacles","Five of Pentacles","Six of Pentacles","Seven of Pentacles","Eight of Pentacles","Nine of Pentacles","Ten of Pentacles","Page of Pentacles","Knight of Pentacles","Queen of Pentacles","King of Pentacles"
];

/* Ảnh lá bài:
   - Ưu tiên: /images/rws/{slug}.jpg  (bạn nên upload pack ảnh vào đây)
   - Fallback: GitHub raw (công khai).
*/
function slugFromCard(name) {
  // normalize name to rider-waite file naming
  // Examples:
  //  "0 - The Fool" => "the-fool"
  //  "X - Wheel of Fortune" => "wheel-of-fortune"
  //  "Ace of Cups" => "ace-of-cups"
  const major = name.match(/^[IVXLCM]+ - /) || name.startsWith("0 -");
  let s = name
    .replace(/^\d+\s*-\s*/, "")   // "0 - " -> ""
    .replace(/^[IVXLCM]+\s*-\s*/, "")
    .trim()
    .toLowerCase();

  s = s
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  // common fixes
  s = s.replace(/^xii?i?-?/, ""); // remove roman left from some patterns
  return s;
}

function getCardImageUrl(name) {
  const slug = slugFromCard(name);
  const local = `/images/rws/${slug}.jpg`;
  const fallback = `https://raw.githubusercontent.com/fffaraz/ULL-Tarot-Images/master/rider-waite/${slug}.jpg`;
  return { local, fallback, slug };
}

/* ====== STATE ====== */
let deck = [];
let drawn = [];            // các lá trong lượt hiện tại
let numToDraw = 1;
let history = [];          // [{timestamp, spreads:[["card1"...]], ai: {...}}, ...]
let deepeningStacks = [];  // các lượt coi sâu thêm (stack card sets)

/* ====== DOM ====== */
const rSpreads = document.querySelectorAll('input[name="spread"]');
const btnDraw = document.getElementById('btnDraw');
const btnComplete = document.getElementById('btnComplete');
const btnDeepen = document.getElementById('btnDeepen');
const btnCombine = document.getElementById('btnCombine');
const btnNew = document.getElementById('btnNew');

const banner = document.getElementById('banner');
const currentCard = document.getElementById('currentCard');
const cardImg = document.getElementById('cardImage');
const cardTitle = document.getElementById('cardTitle');
const currentRow = document.getElementById('currentRow');

const qModes = document.querySelectorAll('input[name="qmode"]');
const manualBox = document.getElementById('manualBox');
const guidedBox = document.getElementById('guidedBox');
const txtQuestion = document.getElementById('txtQuestion');
const selTopic = document.getElementById('selTopic');
const selTime = document.getElementById('selTime');
const txtExtra = document.getElementById('txtExtra');
const btnAskAI = document.getElementById('btnAskAI');
const aiSpinner = document.getElementById('aiSpinner');
const aiErr = document.getElementById('aiErr');
const aiBlocks = document.getElementById('aiBlocks');
const aiCards = document.getElementById('aiCards');
const aiOverall = document.getElementById('aiOverall');
const aiNext = document.getElementById('aiNext');

const historyWrap = document.getElementById('historyWrap');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');

/* ====== UI HELPERS ====== */
function showBanner(msg, type="info") {
  banner.className = `banner ${type}`;
  banner.textContent = msg;
  banner.classList.remove('hidden');
  setTimeout(()=>banner.classList.add('hidden'), 3500);
}

function enableAIButtons() {
  btnAskAI.disabled = drawn.length === 0;
}

function setLoadingAI(on) {
  if (on) {
    aiSpinner.classList.remove('hidden');
    btnAskAI.disabled = true;
  } else {
    aiSpinner.classList.add('hidden');
    btnAskAI.disabled = drawn.length === 0;
  }
}

function clearAI() {
  aiErr.classList.add('hidden');
  aiBlocks.classList.add('hidden');
  aiCards.innerHTML = '';
  aiOverall.textContent = '';
  aiNext.textContent = '';
}

/* ====== CARDS RENDER ====== */
function renderMainCard(name) {
  if (!name) {
    currentCard.classList.remove('flipped');
    cardImg.classList.add('hidden');
    cardTitle.classList.add('hidden');
    return;
  }

  const {local, fallback} = getCardImageUrl(name);

  // try local first, then fallback
  const temp = new Image();
  temp.onload = () => {
    cardImg.src = temp.src;
    cardImg.classList.remove('hidden');
    cardTitle.textContent = name;
    cardTitle.classList.remove('hidden');
    currentCard.classList.add('flipped');
  };
  temp.onerror = () => {
    const temp2 = new Image();
    temp2.onload = () => {
      cardImg.src = temp2.src;
      cardImg.classList.remove('hidden');
      cardTitle.textContent = name;
      cardTitle.classList.remove('hidden');
      currentCard.classList.add('flipped');
    };
    temp2.onerror = () => {
      // nếu cả 2 hỏng thì vẫn show title
      cardImg.classList.add('hidden');
      cardTitle.textContent = name;
      cardTitle.classList.remove('hidden');
      currentCard.classList.add('flipped');
    };
    temp2.src = fallback;
  };
  temp.src = local;
}

function renderRow() {
  currentRow.innerHTML = '';
  drawn.forEach(name => {
    const {local, fallback, slug} = getCardImageUrl(name);
    const wrap = document.createElement('div');
    wrap.className = 'mini';

    const img = new Image();
    img.alt = name;
    img.onload = ()=> wrap.appendChild(img);
    img.onerror = ()=>{
      const img2 = new Image();
      img2.alt = name;
      img2.onload = ()=> wrap.appendChild(img2);
      img2.onerror = ()=>{ wrap.textContent = name; };
      img2.src = fallback;
    };
    img.src = local;

    const cap = document.createElement('div');
    cap.className = 'mini-cap';
    cap.textContent = name;

    wrap.appendChild(cap);
    currentRow.appendChild(wrap);
  });
}

/* ====== GAME LOGIC ====== */
function shuffleDeck() {
  deck = [...ALL_CARDS];
  for (let i=deck.length-1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function newTurnUI() {
  currentCard.classList.remove('flipped');
  cardImg.classList.add('hidden');
  cardTitle.classList.add('hidden');
  currentRow.innerHTML = '';
  btnDraw.disabled = false;
  btnComplete.disabled = true;
  btnDeepen.disabled = true;
  btnCombine.disabled = deepeningStacks.length>0;
  btnNew.disabled = history.length===0 && deepeningStacks.length===0;
  clearAI();
  enableAIButtons();
}

function startNewSpread() {
  drawn = [];
  shuffleDeck();
  newTurnUI();
  showBanner("Bộ bài đã xáo trộn!", "success");
}

function drawOne() {
  if (drawn.length >= numToDraw) {
    showBanner(`Bạn đã bóc đủ ${numToDraw} lá.`, "info");
    return;
  }
  if (deck.length === 0) shuffleDeck();

  const idx = Math.floor(Math.random() * deck.length);
  const card = deck.splice(idx,1)[0];
  drawn.push(card);

  renderMainCard(card);
  renderRow();

  if (drawn.length === numToDraw) {
    btnDraw.disabled = true;
    btnComplete.disabled = true;     // chờ người dùng hỏi AI hoặc "Coi sâu thêm"
    btnDeepen.disabled = false;
    btnCombine.disabled = deepeningStacks.length>0;
    btnNew.disabled = false;
    enableAIButtons();
    showBanner(`Đã đủ ${numToDraw} lá. Bạn có thể hỏi AI hoặc bấm “Coi Sâu Thêm”.`, "success");
  } else {
    btnDraw.textContent = `Bóc Bài (${drawn.length}/${numToDraw})`;
  }
}

function completeSpread(saveOnly=false) {
  if (drawn.length === 0) {
    showBanner("Chưa có lá bài để hoàn tất.", "error");
    return;
  }
  const now = new Date();
  history.push({
    timestamp: now.toLocaleString('vi-VN', {hour12:false}),
    spreads: [ [...drawn] ],
    ai: null
  });
  renderHistory();
  if (!saveOnly) {
    startNewSpread();
  }
}

function deepenSpread() {
  if (drawn.length === 0) return;
  deepeningStacks.push([...drawn]);  // lưu lượt 1
  // cho rút tiếp y như lượt 1 (không xoá card cũ)
  numToDraw = drawn.length;          // rút đúng số lá của lượt đầu
  drawn = [];
  btnDraw.disabled = false;
  btnComplete.disabled = true;
  btnDeepen.disabled = true;
  btnCombine.disabled = deepeningStacks.length<1; // chưa đủ để kết hợp
  clearAI();
  renderMainCard(null);
  renderRow();
  showBanner("Đang coi sâu thêm: bóc thêm bộ lá mới.", "info");
}

function combineAndSave() {
  if (deepeningStacks.length === 0 || drawn.length === 0) return;

  const now = new Date();
  const group = {
    timestamp: now.toLocaleString('vi-VN', {hour12:false}),
    spreads: [...deepeningStacks, [...drawn]],
    ai: null
  };
  history.push(group);
  deepeningStacks = [];
  renderHistory();
  startNewSpread();
  showBanner("Đã lưu bộ coi sâu & tổng quan!", "success");
}

/* ====== AI ====== */
function buildQuestion() {
  const mode = [...qModes].find(r=>r.checked).value;
  if (mode === "manual") {
    return txtQuestion.value.trim();
  } else {
    const parts = [];
    if (selTopic.value) parts.push(`Chủ đề: ${selTopic.value}.`);
    if (selTime.value)  parts.push(`Thời gian: ${selTime.value}.`);
    if (txtExtra.value.trim()) parts.push(`Bổ sung: ${txtExtra.value.trim()}.`);
    return parts.join(" ");
  }
}

async function askAI() {
  if (drawn.length === 0) {
    showBanner("Bạn cần bóc ít nhất 1 lá.", "error");
    return;
  }
  const q = buildQuestion();
  if (!q) {
    showBanner("Vui lòng nhập/chọn câu hỏi.", "error");
    return;
  }

  clearAI();
  setLoadingAI(true);
  aiErr.classList.add('hidden');

  const payload = {
    cards: drawn,
    question: q,
    meta: { spreadCount: drawn.length }
  };

  try {
    const res = await fetch(`${API_BASE}/api/ai-reading`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // Nếu host khác origin, API đã bật CORS trong serverless
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI lỗi ${res.status}. Snippet: ${text.slice(0,120)}`);
    }

    const data = await res.json();
    if (!data || !data.cardInterpretations) throw new Error("Phản hồi AI không hợp lệ.");

    // render
    aiCards.innerHTML = '';
    data.cardInterpretations.forEach(ci=>{
      const blk = document.createElement('div');
      blk.className = 'ai-card';
      blk.innerHTML = `<h4>${ci.cardName}</h4><p>${ci.interpretation}</p>`;
      aiCards.appendChild(blk);
    });
    aiOverall.textContent = data.overallInterpretation || "";
    aiNext.textContent = data.nextStepsSuggestion || "";
    aiBlocks.classList.remove('hidden');

    // lưu vào lịch sử cho bộ mới nhất (nếu có)
    if (history.length>0) {
      history[history.length-1].ai = data;
    }

  } catch (err) {
    aiErr.textContent = err.message;
    aiErr.classList.remove('hidden');
  } finally {
    setLoadingAI(false);
  }
}

/* ====== HISTORY ====== */
function renderHistory() {
  historyWrap.innerHTML = '';
  history.slice().reverse().forEach((item, idxRev)=>{
    const idx = history.length - idxRev;
    const row = document.createElement('div');
    row.className = 'history-row';

    const head = document.createElement('div');
    head.className = 'history-head';
    head.innerHTML = `<strong>Bộ ${idx}</strong> <span>${item.timestamp}</span>`;

    const bar = document.createElement('div');
    bar.className = 'history-bar';

    item.spreads.forEach(sp=>{
      const slot = document.createElement('div');
      slot.className = 'history-slot';
      sp.forEach(c=>{
        const {local, fallback} = getCardImageUrl(c);
        const img = new Image();
        img.onerror = ()=>{img.src=fallback;};
        img.src = local;
        img.alt = c;
        img.title = c;
        slot.appendChild(img);
      });
      bar.appendChild(slot);
    });

    row.appendChild(head);
    row.appendChild(bar);
    row.addEventListener('click', ()=>{
      modal.classList.remove('hidden');
      modalTitle.textContent = `Bộ ${idx} – ${item.timestamp}`;
      const html = item.spreads.map((sp,i)=>(
        `<div class="modal-spread">
           <div class="modal-spread-title">Lượt ${i+1}</div>
           <div class="modal-cards">${sp.map(c=>`<span>${c}</span>`).join('')}</div>
         </div>`
      )).join('') + 
      (item.ai ? `
        <div class="modal-ai">
          <h4>Tổng quan</h4><p>${item.ai.overallInterpretation||""}</p>
          <h4>Gợi ý</h4><p>${item.ai.nextStepsSuggestion||""}</p>
        </div>` : `<div class="modal-ai"><em>Chưa có kết quả AI lưu lại.</em></div>`);
      modalContent.innerHTML = html;
    });

    historyWrap.appendChild(row);
  });
}

/* ====== EVENTS ====== */
rSpreads.forEach(r=>{
  r.addEventListener('change', ()=>{
    numToDraw = parseInt(r.value,10);
    startNewSpread();
  });
});

btnDraw.addEventListener('click', drawOne);
btnComplete.addEventListener('click', ()=>completeSpread());
btnDeepen.addEventListener('click', deepenSpread);
btnCombine.addEventListener('click', combineAndSave);
btnNew.addEventListener('click', ()=>startNewSpread());

qModes.forEach(r=>{
  r.addEventListener('change', ()=>{
    const mode = [...qModes].find(x=>x.checked).value;
    if (mode==="manual") {
      manualBox.classList.remove('hidden');
      guidedBox.classList.add('hidden');
    } else {
      manualBox.classList.add('hidden');
      guidedBox.classList.remove('hidden');
    }
  });
});

btnAskAI.addEventListener('click', askAI);
modalClose.addEventListener('click', ()=>modal.classList.add('hidden'));
modal.addEventListener('click', e=>{
  if (e.target===modal) modal.classList.add('hidden');
});

/* ====== INIT ====== */
(function init(){
  numToDraw = 1;
  shuffleDeck();
  newTurnUI();
})();

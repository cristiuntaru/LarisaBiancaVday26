// ====== Helpers ======
const $ = (sel) => document.querySelector(sel);

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function smoothScrollTo(el){
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function rand(min, max){ return Math.random() * (max-min) + min; }

// ====== Hearts Canvas (floating hearts) ======
const canvas = document.getElementById("heartsCanvas");
const ctx = canvas.getContext("2d");

let W = 0, H = 0;

function resize(){
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(1,0,0,1,0,0);
}
window.addEventListener("resize", resize);
resize();

const hearts = [];
const HEART_COUNT = 42;

function spawnHeart(x = rand(0, W), y = H + rand(0, H*0.2)){
  const size = rand(10, 26) * devicePixelRatio;
  hearts.push({
    x, y,
    vy: rand(0.45, 1.35) * devicePixelRatio,
    vx: rand(-0.25, 0.25) * devicePixelRatio,
    size,
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.008, 0.008),
    alpha: rand(0.35, 0.85),
    hue: rand(330, 360) // pinkish
  });
}

for(let i=0;i<HEART_COUNT;i++){
  spawnHeart(rand(0,W), rand(0,H));
}

function drawHeart(x,y,size,rot,alpha,hue){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  const s = size;
  ctx.beginPath();
  ctx.moveTo(0, -0.30*s);
  ctx.bezierCurveTo(0.35*s, -0.70*s, 0.95*s, -0.25*s, 0, 0.55*s);
  ctx.bezierCurveTo(-0.95*s, -0.25*s, -0.35*s, -0.70*s, 0, -0.30*s);
  ctx.closePath();

  ctx.fillStyle = `hsla(${hue}, 90%, 65%, 1)`;
  ctx.shadowColor = `hsla(${hue}, 90%, 65%, 0.35)`;
  ctx.shadowBlur = 18 * devicePixelRatio;
  ctx.fill();

  ctx.restore();
}

function tick(){
  ctx.clearRect(0,0,W,H);
  for(const h of hearts){
    h.x += h.vx;
    h.y -= h.vy;
    h.rot += h.vr;

    h.vx += rand(-0.01, 0.01) * devicePixelRatio;
    h.vx = clamp(h.vx, -0.6*devicePixelRatio, 0.6*devicePixelRatio);

    drawHeart(h.x, h.y, h.size, h.rot, h.alpha, h.hue);

    if(h.y < -100 * devicePixelRatio){
      h.y = H + rand(30, 140) * devicePixelRatio;
      h.x = rand(0, W);
      h.vy = rand(0.45, 1.45) * devicePixelRatio;
      h.alpha = rand(0.35, 0.85);
      h.size = rand(10, 26) * devicePixelRatio;
    }
  }
  requestAnimationFrame(tick);
}
tick();

// ====== Modal (Letter) ======
const modal = $("#letterModal");
const openLetter = $("#btnOpenLetter");
const closeLetter = $("#btnCloseLetter");
const backdrop = $("#modalBackdrop");
const sealBtn = $("#btnSeal");
const copyBtn = $("#btnCopy");
const signatureEl = $("#signature");

function showModal(){
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function hideModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openLetter.addEventListener("click", showModal);
closeLetter.addEventListener("click", hideModal);
backdrop.addEventListener("click", hideModal);

document.addEventListener("keydown", (e) => {
  if(e.key === "Escape" && modal.classList.contains("show")) hideModal();
});

// ====== Scroll ======
$("#btnScroll").addEventListener("click", () => {
  smoothScrollTo($("#questionSection"));
});

// ====== Cute interactions ======
const resultBox = $("#resultBox");
const btnYes = $("#btnYes");
const btnNo = $("#btnNo");

const yesLines = [
  "🥹 Știam eu! Ai zis DA!",
  "💘 Yay! Tocmai mi-ai făcut ziua perfectă.",
  "🫶 Îți datorez un milion de îmbrățișări."
];

let yesIndex = 0;

function celebrate(message){
  resultBox.textContent = message;
  fireConfetti(180);
  pulseHero();
}

btnYes.addEventListener("click", () => {
  const line = yesLines[yesIndex % yesLines.length];
  yesIndex++;
  celebrate(line);
});

// ====== NO button: NU se mai mișcă. Doar schimbă mesajul la click ======
const noLines = [
  "Vezi că ai ales butonul greșit. Mai încearcă o dată! 😅",
  "Ești sigură? 🙈",
  "Poate vrei să te mai gândești...🥺",
  "Dacă răspunsul e NU, o să-ți trimit o armată de iepurași drăguți să te convingă să te răzgândești! 🐰🐰🐰",
  "Hmm...nu e răspunsul pe care îl așteptam. 😢",
  "🥺 De ce nu vrei să fii Valentine-ul meu?",
  "Iubita? 🥺👉👈",
  "Bitaa? 🥺👉👈👉👈👉👈",
  "Ultima avertizare...",
  "Dacă zici NU, inima lui Bitu face *boom* 💔",
  "😭😭😭",
];

let noIndex = 0;

btnNo.addEventListener("click", () => {
  resultBox.textContent = noLines[noIndex % noLines.length];
  noIndex++;

  // confetti mic (opțional). dacă nu vrei deloc, șterge linia următoare:
  fireConfetti(25);
});

// ====== Confetti (cupids sparkle) ======
function fireConfetti(count = 140){
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  document.body.appendChild(layer);

  for(let i=0;i<count;i++){
    const p = document.createElement("span");
    p.className = "confetti";
    p.textContent = Math.random() < 0.55 ? "💖" : (Math.random() < 0.5 ? "✨" : "💘");
    p.style.left = rand(0, 100) + "vw";
    p.style.animationDuration = rand(1.6, 3.2) + "s";
    p.style.fontSize = rand(14, 26) + "px";
    p.style.filter = `drop-shadow(0 8px 18px rgba(255,77,109,0.25))`;
    layer.appendChild(p);
  }

  setTimeout(() => layer.remove(), 3600);
}

// Inject confetti CSS (keeps files minimal)
const confettiCSS = document.createElement("style");
confettiCSS.textContent = `
.confetti-layer{
  position: fixed; inset:0; pointer-events:none; z-index:9999;
  overflow:hidden;
}
.confetti{
  position:absolute;
  top:-5vh;
  animation: fall linear forwards;
  user-select:none;
}
@keyframes fall{
  0%{ transform: translateY(-10vh) rotate(0deg); opacity:1; }
  100%{ transform: translateY(115vh) rotate(360deg); opacity:0.95; }
}
`;
document.head.appendChild(confettiCSS);

// ====== Hero pulse ======
const heroPolaroid = $("#heroPolaroid");
function pulseHero(){
  heroPolaroid.animate(
    [
      { transform: "rotate(-2deg) scale(1)" },
      { transform: "rotate(2deg) scale(1.03)" },
      { transform: "rotate(-2deg) scale(1)" }
    ],
    { duration: 650, easing: "ease-out" }
  );
}

// ====== Music toggle (optional) ======
const bgm = $("#bgm");
const btnMusic = $("#btnMusic");
let musicOn = false;

btnMusic.addEventListener("click", async () => {
  try{
    if(!musicOn){
      await bgm.play();
      musicOn = true;
      btnMusic.textContent = "🎵 Muzică: ON";
      fireConfetti(40);
    } else {
      bgm.pause();
      musicOn = false;
      btnMusic.textContent = "🎵 Muzică";
    }
  } catch(e){
    resultBox.textContent = "🎵 (Tip: pune un music.mp3 în /assets ca să meargă muzica)";
  }
});

// ====== Magic button ======
$("#btnSparkle").addEventListener("click", () => {
  fireConfetti(120);
  // nu afișăm text în resultBox
});


// ====== Copy letter ======
copyBtn.addEventListener("click", async () => {
  const letterText = [...document.querySelectorAll(".letter p")]
    .map(p => p.innerText.trim())
    .filter(Boolean)
    .join("\n\n");
  try{
    await navigator.clipboard.writeText(letterText);
    resultBox.textContent = "📋 Scrisoarea a fost copiată.";
    fireConfetti(35);
  } catch(e){
    resultBox.textContent = "📋 Nu pot copia automat (browser). Selectează manual textul.";
  }
});

// ====== Seal (cute) ======
sealBtn.addEventListener("click", () => {
  resultBox.textContent = "💗 Sigilat. Acum e oficial: ai un loc în inima mea.";
  fireConfetti(90);
});

// ====== Personalization quick edit (optional) ======
signatureEl.textContent = "Cristian"; // schimbă cu numele tău

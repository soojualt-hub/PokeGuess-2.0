const API = "https://pokeapi.co/api/v2";
const TOTAL = 1025;
const BASE_POINTS = 6;
const SAVE_KEY = "pokeguessSaves";

const $ = id => document.getElementById(id);
const el = {
  sprite:$("sprite"), loader:$("loader"), result:$("result"), form:$("guessForm"),
  guess:$("guess"), guessBtn:$("guessBtn"), hint:$("hintBtn"), reveal:$("revealBtn"),
  next:$("nextBtn"), clues:$("clues"), wrong:$("wrong"),
  score:$("score"), streak:$("streak"), best:$("best"), playerName:$("playerName"),
  menu:$("menu"), game:$("game"), mainPanel:$("mainPanel"), newForm:$("newForm"),
  loadPanel:$("loadPanel"), newBtn:$("newBtn"), loadBtn:$("loadBtn"),
  nameInput:$("nameInput"), nameError:$("nameError"), saveList:$("saveList"),
  cancelNew:$("cancelNew"), backLoad:$("backLoad"), menuBtn:$("menuBtn")
};

/* ================= SAVE SYSTEM ================= */
function getSaves() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; }
  catch { return {}; }
}
function putSaves(saves) { localStorage.setItem(SAVE_KEY, JSON.stringify(saves)); }

let player = null;
let score = 0, streak = 0, best = 0;

function saveProgress() {
  if (!player) return;
  const saves = getSaves();
  saves[player.name.toLowerCase()] = { name:player.name, score, streak, best };
  putSaves(saves);
}

/* ================= MENU ================= */
function showPanel(which) {
  el.mainPanel.hidden = which !== "main";
  el.newForm.hidden = which !== "new";
  el.loadPanel.hidden = which !== "load";
}
function showMenu() {
  el.game.hidden = true; el.menu.hidden = false;
  el.loadBtn.disabled = Object.keys(getSaves()).length === 0;
  showPanel("main");
}

el.newBtn.addEventListener("click", () => {
  el.nameInput.value = ""; el.nameError.textContent = "";
  showPanel("new"); el.nameInput.focus();
});
el.cancelNew.addEventListener("click", () => showPanel("main"));
el.backLoad.addEventListener("click", () => showPanel("main"));

el.newForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = el.nameInput.value.trim().replace(/\s+/g, " ");
  if (!name) { el.nameError.textContent = "Please enter a name."; return; }
  if (getSaves()[name.toLowerCase()]) {
    el.nameError.textContent = `"${name}" is already used by another save. Choose a different name.`;
    return;
  }
  startGame({ name, score:0, streak:0, best:0 });
  saveProgress();
});

el.loadBtn.addEventListener("click", () => {
  renderSaves(); showPanel("load");
});

function renderSaves() {
  el.saveList.innerHTML = "";
  const saves = Object.values(getSaves());
  saves.forEach(s => {
    const li = document.createElement("li");
    const load = document.createElement("button");
    load.className = "load";
    load.textContent = s.name;
    const info = document.createElement("small");
    info.textContent = `Score ${s.score} · Best ${s.best}`;
    load.appendChild(info);
    load.addEventListener("click", () => startGame(s));

    const del = document.createElement("button");
    del.className = "del"; del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete save " + s.name);
    del.addEventListener("click", () => {
      if (!confirm(`Delete the save "${s.name}"?`)) return;
      const all = getSaves(); delete all[s.name.toLowerCase()]; putSaves(all);
      if (Object.keys(all).length === 0) showMenu(); else renderSaves();
    });
    li.append(load, del);
    el.saveList.appendChild(li);
  });
}

el.menuBtn.addEventListener("click", () => { saveProgress(); showMenu(); });

/* ================= GAME ================= */
let game = { pokemon:null, clues:[], shown:0, wrong:0, guesses:0, over:false };

function startGame(save) {
  player = save;
  score = save.score; streak = save.streak; best = save.best;
  el.playerName.textContent = save.name;
  el.menu.hidden = true; el.game.hidden = false;
  loadPokemon();
}

const norm = s => s.toLowerCase().replace(/é/g, "e").replace(/[^a-z0-9]/g, "");
const pretty = s => s.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
const ROMAN = { i:"I", ii:"II", iii:"III", iv:"IV", v:"V", vi:"VI", vii:"VII", viii:"VIII", ix:"IX" };

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("API error " + res.status);
  return res.json();
}

async function loadPokemon() {
  setBusy(true);
  el.result.textContent = ""; el.result.className = "result";
  el.sprite.hidden = true; el.sprite.className = "silhouette";
  el.loader.hidden = false; el.loader.textContent = "Finding a Pokémon…";
  el.clues.innerHTML = ""; el.wrong.textContent = 0;
  updateScores();
  try {
    const id = Math.floor(Math.random() * TOTAL) + 1;
    const [p, s] = await Promise.all([getJSON(`${API}/pokemon/${id}`), getJSON(`${API}/pokemon-species/${id}`)]);
    const genus = (s.genera.find(g => g.language.name === "en") || {}).genus || "Unknown Pokémon";
    const name = s.name;
    game = {
      pokemon:{ name, display:pretty(name), image:p.sprites.other["official-artwork"].front_default || p.sprites.front_default },
      clues:[
        ["Category", genus],
        ["Type", p.types.map(t => pretty(t.type.name)).join(" / ")],
        ["Generation", ROMAN[s.generation.name.split("-")[1]] || "?"],
        ["Abilities", p.abilities.map(a => pretty(a.ability.name)).join(", ")],
        ["Size", `${p.height / 10} m, ${p.weight / 10} kg`],
        ["Name", `Starts with "${name[0].toUpperCase()}", ${name.replace(/-/g, "").length} letters`]
      ],
      shown:1, wrong:0, guesses:0, over:false
    };
    el.sprite.src = game.pokemon.image;
    await new Promise(r => { el.sprite.onload = r; el.sprite.onerror = r; });
    el.loader.hidden = true; el.sprite.hidden = false;
    renderClues(); updateUI();
    el.guess.value = ""; el.guess.focus();
  } catch (err) {
    el.loader.textContent = "Could not reach PokéAPI. Check your connection and press Next Pokémon.";
    el.next.disabled = false;
    console.error(err);
  }
}

function setBusy(b) {
  [el.guess, el.guessBtn, el.hint, el.reveal, el.next].forEach(x => x.disabled = b);
}

function renderClues() {
  el.clues.innerHTML = "";
  game.clues.slice(0, game.shown).forEach(([k, v]) => {
    const li = document.createElement("li");
    const label = document.createElement("span"); label.textContent = k + ":";
    li.append(label, v);
    el.clues.appendChild(li);
  });
}

function updateScores() {
  el.score.textContent = score; el.streak.textContent = streak; el.best.textContent = best;
}

function updateUI() {
  el.wrong.textContent = game.guesses;
  const over = game.over;
  el.guess.disabled = el.guessBtn.disabled = over;
  el.hint.disabled = over || game.shown >= game.clues.length;
  el.reveal.disabled = over;
  el.next.disabled = !over;
  updateScores();
}

function endRound(won) {
  game.over = true;
  if (!won) streak = 0;
  el.sprite.className = "revealed";
  el.result.className = "result " + (won ? "ok" : "bad");
  const n = game.guesses;
  el.result.textContent = won
    ? `Correct! It's ${game.pokemon.display}, guessed in ${n} ${n === 1 ? "try" : "tries"}.`
    : `It was ${game.pokemon.display}.`;
  saveProgress();
  updateUI(); el.next.focus();
}

el.form.addEventListener("submit", e => {
  e.preventDefault();
  if (game.over) return;
  if (!el.guess.value.trim()) {
    el.result.className = "result bad";
    el.result.textContent = "Please type a Pokémon name before pressing Guess.";
    el.guess.focus();
    return;
  }
  game.guesses++;
  if (norm(el.guess.value) === norm(game.pokemon.name)) {
    const hintsUsed = Math.max(0, game.shown - 1 - game.wrong);
    score += Math.max(1, BASE_POINTS - game.guesses - (hintsUsed > 0 ? 1 : 0) + 1);
    streak++;
    if (score > best) best = score;
    endRound(true);
  } else {
    game.wrong++;
    game.shown = Math.min(game.clues.length, game.shown + 1);
    streak = 0;
    el.result.className = "result bad"; el.result.textContent = "Wrong, try again!";
    el.sprite.classList.remove("shake"); void el.sprite.offsetWidth; el.sprite.classList.add("shake");
    el.guess.value = "";
    renderClues(); updateUI(); saveProgress();
  }
});

el.hint.addEventListener("click", () => { game.shown++; renderClues(); updateUI(); });
el.reveal.addEventListener("click", () => endRound(false));
el.next.addEventListener("click", loadPokemon);

showMenu();
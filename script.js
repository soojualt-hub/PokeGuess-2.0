const API = "https://pokeapi.co/api/v2";
const TOTAL = 1025;          // number of Pokémon species in PokéAPI
const MAX_WRONG = 5;

const $ = id => document.getElementById(id);
const el = {
  sprite:$("sprite"), loader:$("loader"), result:$("result"), form:$("guessForm"),
  guess:$("guess"), guessBtn:$("guessBtn"), hint:$("hintBtn"), reveal:$("revealBtn"),
  next:$("nextBtn"), clues:$("clues"), wrong:$("wrong"),
  score:$("score"), streak:$("streak"), best:$("best")
};

let game = { pokemon:null, clues:[], shown:0, wrong:0, over:false };
let score = 0, streak = 0;
let best = Number(localStorage.getItem("pokeguessBest") || 0);
el.best.textContent = best;

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
      shown:1, wrong:0, over:false
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

function updateUI() {
  el.wrong.textContent = game.wrong;
  const over = game.over;
  el.guess.disabled = el.guessBtn.disabled = over;
  el.hint.disabled = over || game.shown >= game.clues.length;
  el.reveal.disabled = over || game.wrong < MAX_WRONG;
  el.next.disabled = !over;
  el.score.textContent = score; el.streak.textContent = streak; el.best.textContent = best;
}

function endRound(won) {
  game.over = true;
  el.sprite.className = "revealed";
  el.result.className = "result " + (won ? "ok" : "bad");
  el.result.textContent = won ? `Correct! It's ${game.pokemon.display}!` : `It was ${game.pokemon.display}.`;
  updateUI(); el.next.focus();
}

el.form.addEventListener("submit", e => {
  e.preventDefault();
  if (game.over || !el.guess.value.trim()) return;
  if (norm(el.guess.value) === norm(game.pokemon.name)) {
    score += Math.max(1, MAX_WRONG + 1 - game.wrong - (game.shown - 1 - game.wrong > 0 ? 1 : 0));
    streak++;
    if (score > best) { best = score; localStorage.setItem("pokeguessBest", best); }
    endRound(true);
  } else {
    game.wrong++;
    game.shown = Math.min(game.clues.length, game.shown + 1);
    streak = 0;
    el.result.className = "result bad"; el.result.textContent = "Wrong, try again!";
    el.sprite.classList.remove("shake"); void el.sprite.offsetWidth; el.sprite.classList.add("shake");
    el.guess.value = "";
    renderClues(); updateUI();
  }
});

el.hint.addEventListener("click", () => { game.shown++; renderClues(); updateUI(); });
el.reveal.addEventListener("click", () => endRound(false));
el.next.addEventListener("click", loadPokemon);

loadPokemon();
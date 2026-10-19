PROJECT TITLE
PokéGuess: Who's That Pokémon?


MEMBERS
1. Jude Jose Sobrevega
2. Renz Zamora


PROJECT DESCRIPTION
PokéGuess is an interactive web game that tests how well you know your
Pokémon. A random Pokémon appears as a black silhouette with one clue. The
player types a guess, and the game says whether it is correct or wrong. Every
wrong guess unlocks another clue (category, type, generation, abilities,
size, and a name hint). When the player guesses correctly, the Pokémon is
revealed in full color and the game shows how many tries it took.

The game is made for Pokémon fans, gamers, students, and casual users who want
to challenge themselves in a fun way.


DEPLOYED WEBSITE
https://soojualt-hub.github.io/PokeGuess-2.0/

GitHub repository:
https://github.com/soojualt-hub/PokeGuess-2.0


HOW TO ACCESS AND USE THE WEBSITE
Accessing the website
1. Open the deployed website link above in any modern browser (Chrome, Edge,
   Firefox, Safari). An internet connection is required.
2. To run it locally instead, download or clone the repository, keep
   index.html, style.css and script.js in the same folder, and open
   index.html in a browser.

Using the website
1. The start screen shows the "How to play" instructions.
2. Click "New Game" and enter your name. Each name must be different from
   every other saved game. Or click "Load Game" to continue a saved game.
3. Look at the silhouette and the first clue, then type your guess and press
   Enter or click "Guess". If the box is empty, the game will ask you to type
   something first.
4. Each wrong guess unlocks another clue. "Show another clue" unlocks one
   without guessing.
5. "Reveal Pokémon" can be pressed at any time to see the answer.
6. The Guesses counter shows how many guesses you used in the round. Fewer
   guesses earn more points.
7. Click "Next Pokémon" for a new round. Click "Save & Exit" to return to the
   start screen.


API USED
PokéAPI (https://pokeapi.co), a free Pokémon API that needs no API key.
Endpoints used:
- https://pokeapi.co/api/v2/pokemon/{id}
  (official artwork, types, abilities, height, weight)
- https://pokeapi.co/api/v2/pokemon-species/{id}
  (name, category, generation)


OTHER IMPORTANT INFORMATION
- Files: index.html (page structure), style.css (design and animations),
  script.js (game logic, API requests, and save system).
- Technologies: HTML, CSS, and JavaScript (no frameworks).
- Saved games (name, score, streak, best score) are stored in the browser's
  localStorage. They stay on the same browser and device only, and clearing
  the browser data deletes them.
- Scoring: a correct first guess earns 6 points. Each extra guess costs 1
  point, and using extra clues costs 1 more, with a minimum of 1 point per
  correct answer.
- Pokémon names, images, and data belong to Nintendo, Game Freak, and
  Creatures Inc. This is a non-commercial fan project made for a class.
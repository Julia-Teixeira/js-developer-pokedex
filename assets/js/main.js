const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const maxRecords = 151;
const limit = 10;
let offset = 0;

async function detailPokemon(pokemonId) {
  let pokemon = await pokeApi.getPokemon(pokemonId);

  const pokemonWeak = await pokeApi.getPokemonWeakeness(pokemon.type);
  pokemon.weaks = await pokemonWeak.double_damage_from.map((weak) => weak.name);

  const pokemonDetails = await pokeApi.getPokemonDetails(pokemon.number);
  const pokemonEvolution = await pokeApi.getPokemonEvolution(
    pokemonDetails.evolution_chain.url
  );
  pokemon.text = pokemonDetails.flavor_text_entries[9].flavor_text;
  pokemon.evolutions = await pokemonEvolution.chain.evolves_to.map(
    async (evolution) => {
      const evolutions = [];

      let img = await pokeApi
        .getPokemonImage(pokemonEvolution.chain.species.name)
        .then((url) => url);

      evolutions.push({
        name: pokemonEvolution.chain.species.name,
        item: null,
        lvl: 0,
        img: img,
      });

      img = await pokeApi
        .getPokemonImage(evolution.species.name)
        .then((url) => url);

      evolutions.push({
        name: evolution.species.name,
        lvl: evolution.evolution_details[0].min_level,
        item: evolution.evolution_details[0].item
          ? evolution.evolution_details[0].item.name
          : null,
        img: img,
      });

      if (evolution.evolves_to[0] !== undefined) {
        img = await pokeApi
          .getPokemonImage(evolution.evolves_to[0].species.name)
          .then((url) => (img = url));
        evolutions.push({
          name: evolution.evolves_to[0].species.name,
          lvl: evolution.evolves_to[0].evolution_details[0].min_level,
          item: evolution.evolves_to[0].evolution_details[0].item
            ? evolution.evolves_to[0].evolution_details[0].item.name
            : null,
          img: img,
        });
      }
      return evolutions;
    }
  )[0];

  pokemon.egg_groups = pokemonDetails.egg_groups.map((group) => {
    return group.name;
  });
  pokemon.habitat = pokemonDetails.habitat.name;
  pokemon.genre = pokemonDetails.genera.find((genus) => {
    if (genus.language.name == "en") {
      return genus.genus;
    }
  }).genus;

  const moves = pokemon.moves.map((move) => move).slice(0, 10);

  const pokemonMoves = await moves.map(async (move) => {
    return await pokeApi.getPokemonMove(move.url);
  });

  pokemon.moves = await Promise.all(pokemonMoves);

  console.log(pokemon);
  const modalContainer = document.getElementById("modalContainer");
  const modalCloseButton = document.getElementById("closeModalButton");
  const modalContent = document.getElementById("modalContent");
  const modal = document.getElementById("modal");

  modalContainer.classList.remove("display-none");
  modalContainer.classList.add("display-block");

  modalCloseButton.addEventListener("click", () => {
    modalContainer.classList.remove("display-block");
    modalContainer.classList.add("display-none");
    modal.classList.remove(`background-${pokemon.type}`);
  });
  modal.classList.add(`background-${pokemon.type}`);
  modalContent.innerHTML = `
   <header class="modalContentHeader">
    <article class="detailPokemon">
     <span class="name">${pokemon.name}</span>
     <span class="number">#${pokemon.number}</span>
     </article>
     <ol class="types">
      ${pokemon.types
        .map((type) => `<li class="type type-${type}">${type}</li>`)
        .join("")}
      </ol>
      <article class="detailPokemonImgContainer">
        <img class="detailPokemonImg"
        src="${pokemon.photo}"
        alt="${pokemon.name}"
        />
      </article>
   </header>
   <article class="modalContentBody">
   <nav class="modalContentBodyNav"> 
    <ul>
      <li id="about" onClick="openAbout()" class="active">About</li>
      <li id="baseStats" onClick="openBaseStats()">Base Stats</li>
      <li id="evolution" onClick="openEvolution()">Evolution</li>
      <li id="moves" onClick="openMoves()">Moves</li>
      </ul>
   </nav>
   
   <section class="modalContentBodyAbout " id="modalContentBodyAbout">
   
   <p class="text">${pokemon.text}</p>
   <h4 class="color-${pokemon.type}">Pokedex Data</h4>
   <article class="about">
  <p class="indice">Species</p>
  <p class="info">${pokemon.genre == undefined ? "-" : pokemon.genre}</p>
  <p class="indice">Height</p>
  <p class="info">${pokemon.height}</p>
  <p class="indice">Weight</p>
  <p class="info">${pokemon.weight}</p>
  <p class="indice">Abilities</p>
  <p class="info">${pokemon.abilities.join(", ")}</p>
  <p class="indice">Weakness</p>
  <p class="info">${pokemon.weaks.join(", ")}</p>
  </article>

  <h4 class="color-${pokemon.type}">Breeding</h4>
  <article class="about">
  <p class="indice">Habitat</p>
  <p class="info">${pokemon.habitat == undefined ? "-" : pokemon.habitat}</p>
  <p class="indice">Egg Groups</p>
  <p class="info">${pokemon.egg_groups
    .map((egg_group) => egg_group)
    .join(", ")}</p>
  </article>
   </section>


   <section class="modalContentBodyBaseStats display-none" id="modalContentBodyBaseStats">
   <h4 class="color-${pokemon.type}">Stats</h4>
   <article class="baseStats">
    ${pokemon.stats
      .map(
        (stats) => `<p class="indice">${
          stats.name.includes("special")
            ? "SP " + stats.name.slice(8)
            : stats.name
        }</p>
    <p class="info">${stats.value}</p>
    <spam class="statBar">
    <spam class="statBarValue ${
      stats.value < 50 ? "color-red" : `type-${pokemon.type}`
    }" style="width: ${
          stats.value > 100 ? 100 * 1.82 : stats.value * 1.82
        }px; height: 4px;"></spam> </spam>`
      )
      .join("")}
   </article>
   </section>


   <section class="modalContentBodyEvolution display-none" id="modalContentBodyEvolution">
   <article class="evolution">
    ${
      pokemon.evolutions !== undefined
        ? `
   <section class="evolutionContainer">
   <div>
   <div class="evolutionImgContainer">
 
   <img class="evolutionImg" src="${pokemon.evolutions[0].img}" alt="${
            pokemon.evolutions[0].name
          }"/>
        
         </div>
         <h5 class="evolutionName">${pokemon.evolutions[0].name}</h5>
</div>
   <div class="evolutionLvlContainer">
   <i class="bi bi-arrow-right"></i>
   <spam class="evolutionLvl">${
     pokemon.evolutions[1].lvl == null && pokemon.evolutions[1].item != null
       ? `<span class="evolutionItem">${pokemon.evolutions[1].item}</span>`
       : pokemon.evolutions[1].lvl == null
       ? "-"
       : `Lvl ${pokemon.evolutions[1].lvl}`
   } </spam>
   </div>
   <div>
   <div class="evolutionImgContainer">
   <img class="evolutionImg" src="${pokemon.evolutions[1].img}" alt="${
            pokemon.evolutions[1].name
          }"/>
         </div>
         <h5 class="evolutionName">${pokemon.evolutions[1].name}</h5>
   </div>
   </section>
  ${
    pokemon.evolutions[2] !== undefined
      ? `   <section class="evolutionContainer">
    <div>
    <div class="evolutionImgContainer">
    <img class="evolutionImg" src="${pokemon.evolutions[1].img}" alt="${
          pokemon.evolutions[1].name
        }"/>
          </div>
          <h5 class="evolutionName">${pokemon.evolutions[1].name}</h5>
    </div>

        <div class="evolutionLvlContainer">
          <i class="bi bi-arrow-right"></i>
          <spam class="evolutionLvl"> ${
            pokemon.evolutions[2].lvl == null &&
            pokemon.evolutions[2].item != null
              ? `<span class="evolutionItem">${pokemon.evolutions[2].item}</span>`
              : pokemon.evolutions[2].lvl == null
              ? "-"
              : `Lvl ${pokemon.evolutions[2].lvl}`
          } </spam>
        </div>
        <div>
        <div class="evolutionImgContainer">
          <img
            class="evolutionImg"
            src="${pokemon.evolutions[2].img}"
            alt="${pokemon.evolutions[2].name}"
          />
          </div>
          <h5 class="evolutionName">${pokemon.evolutions[2].name}</h5>
        </div>

      </section>`
      : ""
  }
   `
        : `<h3>Ainda não ha evoluções</h3>`
    }
    </section>
    <section class="modalContentBodyMoves display-none" id="modalContentBodyMoves">
    <article class="movesHeader color-${pokemon.type}">
    <p class="">#ID</p>
    <p class="">Name</p>
    <p class="">PP</p>
    <p class="">Power</p>
    <p class="">Acc</p>
    </article>
       <article class="moves">
       ${pokemon.moves
         .map(
           (move) =>
             `<p class="moveId">${move.id}</p>
          <p class="moveName">${move.name}</p>
          <p class="movePP">${move.pp}</p>
          <p class="movePower">${move.power}</p>
          <p class="moveAcuracy">${move.accuracy}</p>`
         )
         .join("")}
       </article >
     </section>
   </article>
   </article>
  `;
}

function convertPokemonToLi(pokemon) {
  return `
    <li class="pokemon background-${pokemon.type}" id="${
    pokemon.number
  }" onClick="detailPokemon(${pokemon.number})" >
    <header>
      <span class="name">${pokemon.name}</span>
      <span class="number">#${pokemon.number}</span>
    </header>
    <article class="detail">
      <ol class="types">
      ${pokemon.types
        .map((type) => `<li class="type type-${type}">${type}</li>`)
        .join("")}
      </ol>
      <section class="detailImage">
      <img
        src="${pokemon.photo}"
        alt="${pokemon.name}"
      />
      </section>
    </article>
  </li>
  `;
}

function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    const newHtml = pokemons.map(convertPokemonToLi).join("");
    pokemonList.innerHTML += newHtml;
  });
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  const qtdRecordsWithNexPage = offset + limit;

  if (qtdRecordsWithNexPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItens(offset, newLimit);

    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItens(offset, limit);
  }
});

function openAbout() {
  const about = document.getElementById("about");
  const baseStats = document.getElementById("baseStats");
  const evolution = document.getElementById("evolution");
  const moves = document.getElementById("moves");

  about.classList.add("active");
  baseStats.classList.remove("active");
  evolution.classList.remove("active");
  moves.classList.remove("active");

  const modalContentBodyAbout = document.getElementById(
    "modalContentBodyAbout"
  );
  const modalContentBodyBaseStats = document.getElementById(
    "modalContentBodyBaseStats"
  );
  const modalContentBodyEvolution = document.getElementById(
    "modalContentBodyEvolution"
  );
  const modalContentBodyMoves = document.getElementById(
    "modalContentBodyMoves"
  );

  modalContentBodyAbout.classList.remove("display-none");
  modalContentBodyEvolution.classList.add("display-none");
  modalContentBodyMoves.classList.add("display-none");
  modalContentBodyBaseStats.classList.add("display-none");
}

function openBaseStats() {
  const about = document.getElementById("about");
  const baseStats = document.getElementById("baseStats");
  const evolution = document.getElementById("evolution");
  const moves = document.getElementById("moves");

  baseStats.classList.add("active");
  about.classList.remove("active");
  evolution.classList.remove("active");
  moves.classList.remove("active");

  const modalContentBodyAbout = document.getElementById(
    "modalContentBodyAbout"
  );
  const modalContentBodyBaseStats = document.getElementById(
    "modalContentBodyBaseStats"
  );
  const modalContentBodyEvolution = document.getElementById(
    "modalContentBodyEvolution"
  );
  const modalContentBodyMoves = document.getElementById(
    "modalContentBodyMoves"
  );

  modalContentBodyAbout.classList.add("display-none");
  modalContentBodyEvolution.classList.add("display-none");
  modalContentBodyMoves.classList.add("display-none");
  modalContentBodyBaseStats.classList.remove("display-none");
}

function openEvolution() {
  const about = document.getElementById("about");
  const baseStats = document.getElementById("baseStats");
  const evolution = document.getElementById("evolution");
  const moves = document.getElementById("moves");

  evolution.classList.add("active");
  about.classList.remove("active");
  baseStats.classList.remove("active");
  moves.classList.remove("active");

  const modalContentBodyAbout = document.getElementById(
    "modalContentBodyAbout"
  );
  const modalContentBodyBaseStats = document.getElementById(
    "modalContentBodyBaseStats"
  );
  const modalContentBodyEvolution = document.getElementById(
    "modalContentBodyEvolution"
  );
  const modalContentBodyMoves = document.getElementById(
    "modalContentBodyMoves"
  );

  modalContentBodyAbout.classList.add("display-none");
  modalContentBodyEvolution.classList.remove("display-none");
  modalContentBodyMoves.classList.add("display-none");
  modalContentBodyBaseStats.classList.add("display-none");
}

function openMoves() {
  const about = document.getElementById("about");
  const baseStats = document.getElementById("baseStats");
  const evolution = document.getElementById("evolution");
  const moves = document.getElementById("moves");

  moves.classList.add("active");
  about.classList.remove("active");
  baseStats.classList.remove("active");
  evolution.classList.remove("active");

  const modalContentBodyAbout = document.getElementById(
    "modalContentBodyAbout"
  );
  const modalContentBodyBaseStats = document.getElementById(
    "modalContentBodyBaseStats"
  );
  const modalContentBodyEvolution = document.getElementById(
    "modalContentBodyEvolution"
  );
  const modalContentBodyMoves = document.getElementById(
    "modalContentBodyMoves"
  );

  modalContentBodyAbout.classList.add("display-none");
  modalContentBodyEvolution.classList.add("display-none");
  modalContentBodyMoves.classList.remove("display-none");
  modalContentBodyBaseStats.classList.add("display-none");
}

const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokeDetail.id;
  pokemon.name = pokeDetail.name;
  pokemon.moves = pokeDetail.moves.map((move) => move.move);

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name) || [];
  const [type] = types;

  pokemon.types = types;
  pokemon.type = type;

  pokemon.photo = pokeDetail.sprites.other.dream_world.front_default;

  pokemon.abilities = pokeDetail.abilities.map((abilitySlot) => {
    return abilitySlot.ability.name;
  });

  pokemon.height = `${Math.trunc(pokeDetail.height / 3.048)}'${(
    (pokeDetail.height / 3.048 - Math.trunc(pokeDetail.height / 3.048)) *
    12
  ).toFixed(1)}" (${(pokeDetail.height / 10).toFixed(2)} cm)`;

  pokemon.weight = `${(pokeDetail.weight / 4.536).toFixed(1)} lbs (${(
    pokeDetail.weight / 10
  ).toFixed(1)}kg)`;

  pokemon.stats =
    pokeDetail.stats.map((stat) => {
      return {
        name: stat.stat.name,
        value: stat.base_stat,
      };
    }) || [];

  return pokemon;
}

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then((pokemonDetail) => convertPokeApiDetailToPokemon(pokemonDetail));
};

pokeApi.getPokemons = (offset = 0, limit = 5) => {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequests) => Promise.all(detailRequests))
    .then((pokemonsDetails) => pokemonsDetails);
};

pokeApi.getPokemon = (id) => {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    .then((response) => response.json())
    .then((pokemon) => convertPokeApiDetailToPokemon(pokemon));
};

pokeApi.getPokemonDetails = (id) => {
  return fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    .then((response) => response.json())
    .then((poke) => poke);
};

pokeApi.getPokemonEvolution = (url) => {
  return fetch(url)
    .then((response) => response.json())
    .then((poke) => poke);
};

pokeApi.getPokemonImage = (name) => {
  return fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
    .then((response) => response.json())
    .then((pokemon) => pokemon.sprites.other.dream_world.front_default);
};
pokeApi.getPokemonWeakeness = (name) => {
  return fetch(`https://pokeapi.co/api/v2/type/${name}`)
    .then((response) => response.json())
    .then((pokemon) => pokemon.damage_relations);
};

pokeApi.getPokemonMove = (url) => {
  return fetch(url)
    .then((response) => response.json())
    .then((poke) => {
      return {
        id: poke.id,
        accuracy: poke.accuracy,
        name: poke.name,
        power: poke.power == null ? "none" : poke.power,
        pp: poke.pp,
        type: poke.type.name,
        type_damege: poke.damage_class.name,
      };
    });
};

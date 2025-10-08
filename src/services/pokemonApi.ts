import axios from 'axios';
import { Pokemon, PokemonListResponse, PokemonListItem } from '../types/Pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Cache for Pokemon data to avoid repeated API calls
const pokemonCache = new Map<number, Pokemon>();
const listCache = new Map<string, PokemonListResponse>();

export const pokemonApi = {
  // Get list of Pokemon with pagination
  async getPokemonList(limit: number = 151, offset: number = 0): Promise<PokemonListResponse> {
    const cacheKey = `list-${limit}-${offset}`;
    
    if (listCache.has(cacheKey)) {
      return listCache.get(cacheKey)!;
    }

    try {
      const response = await api.get<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
      listCache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokemon list:', error);
      throw new Error('Failed to fetch Pokemon list');
    }
  },

  // Get detailed Pokemon data by ID or name
  async getPokemon(idOrName: number | string): Promise<Pokemon> {
    const id = typeof idOrName === 'string' ? parseInt(idOrName) : idOrName;
    
    if (pokemonCache.has(id)) {
      return pokemonCache.get(id)!;
    }

    try {
      const response = await api.get<Pokemon>(`/pokemon/${idOrName}`);
      pokemonCache.set(id, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Pokemon ${idOrName}:`, error);
      throw new Error(`Failed to fetch Pokemon ${idOrName}`);
    }
  },

  // Get Pokemon types for filtering
  async getPokemonTypes(): Promise<{ name: string; url: string }[]> {
    try {
      const response = await api.get('/type');
      return response.data.results;
    } catch (error) {
      console.error('Error fetching Pokemon types:', error);
      throw new Error('Failed to fetch Pokemon types');
    }
  },

  // Search Pokemon by name
  async searchPokemon(query: string): Promise<PokemonListItem[]> {
    try {
      // Get all Pokemon and filter by name
      const response = await api.get<PokemonListResponse>('/pokemon?limit=151&offset=0');
      return response.data.results.filter(pokemon => 
        pokemon.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching Pokemon:', error);
      throw new Error('Failed to search Pokemon');
    }
  }
};

export default pokemonApi;
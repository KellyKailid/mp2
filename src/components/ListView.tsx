import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pokemon, PokemonListItem, SortOption } from '../types/Pokemon';
import { pokemonApi } from '../services/pokemonApi';
import LoadingSpinner from './LoadingSpinner';
import './ListView.css';

const ListView: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [pokemonDetails, setPokemonDetails] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>({ property: 'name', direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pokemonApi.getPokemonList(151, 0);
        setPokemonList(response.results);
        
        // Fetch detailed data for all Pokemon
        const details = await Promise.all(
          response.results.map(async (pokemon) => {
            const id = pokemon.url.split('/').slice(-2, -1)[0];
            return pokemonApi.getPokemon(parseInt(id));
          })
        );
        setPokemonDetails(details);
      } catch (err) {
        setError('Failed to load Pokemon data');
        console.error('Error fetching Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  const filteredAndSortedPokemon = useMemo(() => {
    let filtered = pokemonDetails.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortOption.property];
      let bValue: any = b[sortOption.property];

      if (sortOption.property === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOption.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [pokemonDetails, searchQuery, sortOption]);

  const handleSortChange = (property: 'name' | 'id' | 'height' | 'weight') => {
    setSortOption(prev => ({
      property,
      direction: prev.property === property && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) {
    return (
      <div className="list-view">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-view">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="list-view">
      <div className="list-header">
        <h2>Pokemon List</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="sort-container">
          <span>Sort by:</span>
          <button
            onClick={() => handleSortChange('name')}
            className={`sort-btn ${sortOption.property === 'name' ? 'active' : ''}`}
          >
            Name {sortOption.property === 'name' && (sortOption.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('id')}
            className={`sort-btn ${sortOption.property === 'id' ? 'active' : ''}`}
          >
            ID {sortOption.property === 'id' && (sortOption.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('height')}
            className={`sort-btn ${sortOption.property === 'height' ? 'active' : ''}`}
          >
            Height {sortOption.property === 'height' && (sortOption.direction === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('weight')}
            className={`sort-btn ${sortOption.property === 'weight' ? 'active' : ''}`}
          >
            Weight {sortOption.property === 'weight' && (sortOption.direction === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
      
      <div className="pokemon-grid">
        {filteredAndSortedPokemon.map((pokemon) => (
          <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`} className="pokemon-card">
            <div className="pokemon-image">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = pokemon.sprites.front_default;
                }}
              />
            </div>
            <div className="pokemon-info">
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <p>#{pokemon.id.toString().padStart(3, '0')}</p>
              <div className="pokemon-types">
                {pokemon.types.map((type, index) => (
                  <span key={index} className={`type-badge type-${type.type.name}`}>
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListView;
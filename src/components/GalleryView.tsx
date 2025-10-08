import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pokemon, FilterOption } from '../types/Pokemon';
import { pokemonApi } from '../services/pokemonApi';
import LoadingSpinner from './LoadingSpinner';
import './GalleryView.css';

const GalleryView: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await pokemonApi.getPokemonList(151, 0);
        
        // Fetch detailed data for all Pokemon
        const details = await Promise.all(
          response.results.map(async (pokemon) => {
            const id = pokemon.url.split('/').slice(-2, -1)[0];
            return pokemonApi.getPokemon(parseInt(id));
          })
        );
        setPokemonList(details);

        // Extract unique types for filtering
        const types = new Set<string>();
        details.forEach(pokemon => {
          pokemon.types.forEach(type => {
            types.add(type.type.name);
          });
        });
        
        const sortedTypes = Array.from(types).sort();
        setSelectedTypes(sortedTypes.map(type => ({ type, selected: false })));
      } catch (err) {
        setError('Failed to load Pokemon data');
        console.error('Error fetching Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  const filteredPokemon = useMemo(() => {
    const activeFilters = selectedTypes.filter(filter => filter.selected).map(filter => filter.type);
    
    if (activeFilters.length === 0) {
      return pokemonList;
    }

    return pokemonList.filter(pokemon =>
      pokemon.types.some(type => activeFilters.includes(type.type.name))
    );
  }, [pokemonList, selectedTypes]);

  const handleTypeToggle = (typeName: string) => {
    setSelectedTypes(prev =>
      prev.map(filter =>
        filter.type === typeName
          ? { ...filter, selected: !filter.selected }
          : filter
      )
    );
  };

  const clearAllFilters = () => {
    setSelectedTypes(prev =>
      prev.map(filter => ({ ...filter, selected: false }))
    );
  };

  const selectAllFilters = () => {
    setSelectedTypes(prev =>
      prev.map(filter => ({ ...filter, selected: true }))
    );
  };

  if (loading) {
    return (
      <div className="gallery-view">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-view">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="gallery-view">
      <div className="gallery-header">
        <h2>Pokemon Gallery</h2>
        <div className="filter-controls">
          <div className="filter-buttons">
            <button onClick={selectAllFilters} className="filter-btn select-all">
              Select All
            </button>
            <button onClick={clearAllFilters} className="filter-btn clear-all">
              Clear All
            </button>
          </div>
          <div className="type-filters">
            {selectedTypes.map((filter) => (
              <button
                key={filter.type}
                onClick={() => handleTypeToggle(filter.type)}
                className={`type-filter ${filter.selected ? 'active' : ''}`}
              >
                {filter.type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="gallery-grid">
        {filteredPokemon.map((pokemon) => (
          <Link key={pokemon.id} to={`/pokemon/${pokemon.id}`} className="gallery-item">
            <div className="gallery-image">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = pokemon.sprites.front_default;
                }}
              />
            </div>
            <div className="gallery-overlay">
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <p>#{pokemon.id.toString().padStart(3, '0')}</p>
            </div>
          </Link>
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div className="no-results">
          <p>No Pokemon match the selected filters.</p>
          <button onClick={clearAllFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
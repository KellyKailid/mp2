import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pokemon } from '../types/Pokemon';
import { pokemonApi } from '../services/pokemonApi';
import LoadingSpinner from './LoadingSpinner';
import './DetailView.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<number>(parseInt(id || '1'));

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const pokemonData = await pokemonApi.getPokemon(parseInt(id));
        setPokemon(pokemonData);
        setCurrentId(parseInt(id));
      } catch (err) {
        setError('Failed to load Pokemon details');
        console.error('Error fetching Pokemon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [id]);

  const handlePrevious = () => {
    if (currentId > 1) {
      const newId = currentId - 1;
      setCurrentId(newId);
      navigate(`/pokemon/${newId}`);
    }
  };

  const handleNext = () => {
    if (currentId < 151) {
      const newId = currentId + 1;
      setCurrentId(newId);
      navigate(`/pokemon/${newId}`);
    }
  };

  if (loading) {
    return (
      <div className="detail-view">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="detail-view">
        <div className="error">{error || 'Pokemon not found'}</div>
        <Link to="/" className="back-link">← Back to List</Link>
      </div>
    );
  }

  const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
      hp: '#e74c3c',
      attack: '#f39c12',
      defense: '#3498db',
      'special-attack': '#9b59b6',
      'special-defense': '#2ecc71',
      speed: '#1abc9c'
    };
    return colors[statName] || '#95a5a6';
  };

  const getStatName = (statName: string) => {
    const names: { [key: string]: string } = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Attack',
      'special-defense': 'Sp. Defense',
      speed: 'Speed'
    };
    return names[statName] || statName;
  };

  return (
    <div className="detail-view">
      <div className="detail-header">
        <Link to="/" className="back-link">← Back to List</Link>
        <div className="navigation-buttons">
          <button 
            onClick={handlePrevious} 
            disabled={currentId <= 1}
            className="nav-button prev"
          >
            ← Previous
          </button>
          <button 
            onClick={handleNext} 
            disabled={currentId >= 151}
            className="nav-button next"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="pokemon-detail">
        <div className="pokemon-image-section">
          <div className="pokemon-image-container">
            <img
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
              className="pokemon-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = pokemon.sprites.front_default;
              }}
            />
          </div>
          <div className="pokemon-basic-info">
            <h1 className="pokemon-name">
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </h1>
            <p className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</p>
            <div className="pokemon-types">
              {pokemon.types.map((type, index) => (
                <span key={index} className={`type-badge type-${type.type.name}`}>
                  {type.type.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pokemon-details">
          <div className="detail-section">
            <h3>Physical Characteristics</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Height</span>
                <span className="detail-value">{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight</span>
                <span className="detail-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Base Experience</span>
                <span className="detail-value">{pokemon.base_experience}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Base Stats</h3>
            <div className="stats-container">
              {pokemon.stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-header">
                    <span className="stat-name">{getStatName(stat.stat.name)}</span>
                    <span className="stat-value">{stat.base_stat}</span>
                  </div>
                  <div className="stat-bar">
                    <div 
                      className="stat-fill"
                      style={{
                        width: `${(stat.base_stat / 255) * 100}%`,
                        backgroundColor: getStatColor(stat.stat.name)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Abilities</h3>
            <div className="abilities-container">
              {pokemon.abilities.map((ability, index) => (
                <div key={index} className="ability-item">
                  <span className="ability-name">
                    {ability.ability.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {ability.is_hidden && <span className="hidden-ability">(Hidden)</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Moves ({pokemon.moves.length})</h3>
            <div className="moves-container">
              {pokemon.moves.slice(0, 20).map((move, index) => (
                <span key={index} className="move-item">
                  {move.move.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
              {pokemon.moves.length > 20 && (
                <span className="more-moves">... and {pokemon.moves.length - 20} more</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
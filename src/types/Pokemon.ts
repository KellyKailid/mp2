export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: any[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface SortOption {
  property: 'name' | 'id' | 'height' | 'weight';
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  type: string;
  selected: boolean;
}
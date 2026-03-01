'use client';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function Search({ value, onChange, placeholder = 'Buscar caso...', disabled = false }: SearchProps) {
  return (
    <search className="flex items-center">
      <form
        className="flex items-center h-10 border border-primary rounded-full bg-transparent w-full max-w-2xl"
        onSubmit={(e) => e.preventDefault()}
      >
        <label className="flex items-center w-full">
          <input
            id="search-input"
            type="search"
            name="q"
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-4 py-2.5 h-full focus:outline-none bg-transparent text-base text-foreground placeholder:text-[var(--card-text-muted)] opacity-80"
          />
          <SearchIcon className="w-[18px] h-[18px] text-foreground opacity-60 mr-3" />
        </label>
      </form>
    </search>
  );
}

export default Search;
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

function Search() {
  return (
    <search className="flex items-center">
      {/* El form se usará más adelante */}
      <form className="flex items-center h-10 border border-primary rounded-full bg-transparent w-full max-w-2xl">
        <label className="flex items-center w-full">
          <input
            id="search-input"
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Buscar caso..."
            className="flex-1 px-4 py-2.5 h-full focus:outline-none bg-transparent text-base text-foreground placeholder:text-gray-500"
          />
          <MagnifyingGlassIcon className="w-[18px] h-[18px] text-[#414040] mr-3" />
        </label>
        <input type="hidden" value="Buscar"/>
      </form> 
    </search>
  );
}

export default Search;
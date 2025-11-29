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
            className="flex-1 px-4 py-2.5 h-full focus:outline-none bg-transparent text-sm text-foreground placeholder:text-gray-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#414040"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-search mr-3"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>
        </label>
        <input type="hidden" value="Buscar"/>
      </form> 
    </search>
  );
}

export default Search;
function Search() {
  return (
    <search className="flex items-center">
      {/* El form se usará más adelante */}
      <form className="px-5 py-2 flex items-center gap-2 border border-primary rounded-full w-xl">
        <label className="flex items-center w-full">
          <input
            id="search-input"
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Buscar caso..."
            className="flex-1 pr-2 px-4 py-2 focus:outline-none bg-transparent"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#414040"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-search "
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
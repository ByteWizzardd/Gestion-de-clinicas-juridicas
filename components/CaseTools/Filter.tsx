import Button from "../ui/Button";

function Filter() {
  return (
    <button className="h-10 px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors">
      {/*SVG de filtro */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="#414040"
        className="icon icon-tabler icons-tabler-filled icon-tabler-filter"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M20 3h-16a1 1 0 0 0 -1 1v2.227l.008 .223a3 3 0 0 0 .772 1.795l4.22 4.641v8.114a1 1 0 0 0 1.316 .949l6 -2l.108 -.043a1 1 0 0 0 .576 -.906v-6.586l4.121 -4.12a3 3 0 0 0 .879 -2.123v-2.171a1 1 0 0 0 -1 -1z" />
      </svg>
      <span className="text-sm text-center">Filtro</span>
    </button>
  );
}

export default Filter;
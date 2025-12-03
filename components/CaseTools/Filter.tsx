import { FunnelIcon } from '@heroicons/react/24/solid';

function Filter() {
  return (
    <button className="h-10 px-4  cursor-pointer rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors">
      <FunnelIcon className="w-[18px] h-[18px] text-[#414040]" />
      <span className="text-base text-center">Filtro</span>
    </button>
  );
}

export default Filter;
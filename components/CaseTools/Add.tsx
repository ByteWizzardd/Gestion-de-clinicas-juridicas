import { Plus } from 'lucide-react';

type AddProps = {
  label?: string;
  onClick?: () => void;
};

function Add({ label, onClick }: AddProps) {
  return (
    <button
      onClick={onClick}
      className="h-10 w-full sm:w-auto cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-all"
    >
      <Plus className="w-[18px] h-[18px] text-foreground opacity-60" />
      <span className="text-base text-center">{label}</span>
    </button>
  );
}

export default Add;
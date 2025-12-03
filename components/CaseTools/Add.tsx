import { Plus } from 'lucide-react';

type AddProps = {
  label?: string;
};

function Add({label}: AddProps) {
  return (
    <button className="h-10  cursor-pointer px-4 rounded-full bg-transparent border border-primary text-foreground flex items-center justify-center gap-1.5 whitespace-nowrap hover:bg-primary-light transition-colors">
      <Plus className="w-[18px] h-[18px] text-[#414040]" />
      <span className="text-base text-center">{label}</span>
    </button>
  );
}

export default Add;
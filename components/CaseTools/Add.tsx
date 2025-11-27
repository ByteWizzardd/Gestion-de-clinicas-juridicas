import Button from "../ui/Button";

type AddProps = {
  label?: string;
};

function Add({label}: AddProps) {
  return (
    <Button
      variant="outline"
      className="w-50 h-10 rounded-full! text-foreground! flex items-center justify-center gap-3"
    >
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
        className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 5l0 14" />
        <path d="M5 12l14 0" />
      </svg>
      <span className="text-center">{label}</span>
    </Button>
  );
}

export default Add;
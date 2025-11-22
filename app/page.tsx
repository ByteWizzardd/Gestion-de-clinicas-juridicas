import { TableHeader } from "../components/Table/TableHeader";

export default function Home() {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background gap-4 flex-col">
        <h1 className="text-4xl font-bold">oa muchachos ayuda</h1>
      </div>
      <TableHeader title={["Nombre", "Edad", "Correo"]} />
    </>
  );
}


import Table from "@/components/Table/Table";

const data = [
  { nombre: "Juan", edad: 28, correo: "juan@mail.com" },
  { nombre: "Ana", edad: 32, correo: "ana@mail.com" },
  { nombre: "Luis", edad: 24, correo: "luis@mail.com" },
];

export default function PruebaPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tabla de Prueba</h1>
      <Table data={data} columns={["Nombre", "Edad", "Correo"]} />
    </div>
  );
}
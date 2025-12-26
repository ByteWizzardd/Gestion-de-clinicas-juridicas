import { redirect } from "next/navigation";

export default function Home() {
  // redirigir directamente a la página de autenticación
  redirect("/auth");
}

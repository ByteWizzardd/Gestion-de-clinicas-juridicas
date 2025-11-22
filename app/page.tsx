import { redirect } from "next/navigation";

export default function Home() {
  // redirigir directamente al dashboard
  redirect("/dashboard");
}
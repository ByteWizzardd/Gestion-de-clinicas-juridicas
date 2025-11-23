import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
export default function RegisterPage() {
    return(
        <div className="bg-background relative overflow-hidden h-screen">
            {/* Flecha para volver - Lado derecho del círculo */}
            <Link href="/auth" className="absolute top-10  left-[820px] z-30 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeftIcon className="w-8 h-8 text-foreground hover:text-primary transition-colors" />
            </Link>
            {/* Contenedor principal con layout flex */}
            <div className="flex h-screen items-center justify-end px-12 relative">
                {/* Círculo con información y decoración - Izquierda */}
                <div className="absolute left-5 top-1/2 -translate-y-1/2 -translate-x-1/2 font-primary">
                    <div className="w-[1620px] h-[1620px] flex flex-col justify-center items-end rounded-full border-4 border-primary bg-primary">
                        <p className="text-white w-1/2 font-semibold text-7xl text-left pr-20 pl-15">Acceso a la Justicia para Todos. </p>
                        <p className="text-white text-left w-1/2 text-4xl/8 pr-40 pl-15 mt-2">Su trabajo garantiza un proceso eficaz y responsable.</p>
                    </div>
                </div>
                {/* Cuadro para registrar - Derecha */}
                <div className="w-full max-w-md pr-15">
                    <div className="flex flex-col gap-6 w-full">
                        <div className="mb-5">
                            <h1 className="text-5xl font-normal text-foreground mb-2 text-center font-primary">Crear Cuenta</h1>
                            <div className="w-full h-0.5 bg-secondary mt-5"/>
                        </div>
                        <div className="flex flex-col gap-4 !font-urbanist">
                            <Input label="Nombre Completo" placeholder="Ingrese su nombre completo" className="bg-gray-100 text-base"/>
                            <Input label="Correo institucional" placeholder="Ingrese su correo institucional" className="bg-gray-100 text-base"/>
                            <Input label="Contraseña" placeholder="Ingrese su contraseña" type="password" className="bg-gray-100 text-base"/>
                            <Input label="Confirmar contraseña" placeholder="Ingrese su contraseña" type="password" className="bg-gray-100 text-base"/>
                        </div>
                        <div className="flex flex-col gap-2 mt-4 !font-urbanist">
                            <Button children="Registrarse" variant="primary" size="lg" isLoading={false}  className="!rounded-3xl !text-xl w-full" />
                            <p className="text-base text-center text-foreground">
                                ¿Ya tiene una cuenta? <Link href="/auth/login" className="text-primary hover:underline">Inicie sesión acá</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
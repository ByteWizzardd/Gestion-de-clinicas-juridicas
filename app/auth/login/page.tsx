import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
export default function LoginPage() {
    return(
        <div className="bg-background relative overflow-hidden h-screen">
            {/* Flecha para volver - Esquina superior izquierda */}
            <Link href="/auth" className="absolute top-10 left-8 z-30 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeftIcon className="w-8 h-8 text-foreground hover:text-primary transition-colors" />
            </Link>
            {/* Contenedor principal con layout flex */}
            <div className="flex h-screen items-center justify-start px-12 relative">
                {/* Cuadro para iniciar sesión - Izquierda */}
                <div className="w-full max-w-md pl-15">
                    <div className="flex flex-col gap-6 w-full">
                        <div className="mb-5">
                            <h1 className="text-5xl font-normal text-foreground mb-2 text-center font-primary">Iniciar Sesión</h1>
                            <div className="w-full h-0.5 bg-secondary mt-5"/>
                        </div>
                        <div className="flex flex-col gap-4 !font-urbanist">
                            <Input label="Correo institucional" placeholder="Ingrese su correo institucional" className="bg-gray-100 text-base"/>
                            <Input label="Contraseña" placeholder="Ingrese su contraseña" className="bg-gray-200 !text-base"/>
                            <Link href="#" className="text-base text-primary text-right -mt-2 hover:underline">¿Olvidó su contraseña?</Link>
                        </div>
                        <div className="flex flex-col gap-2 mt-4 !font-urbanist">
                            <Button children="Ingresar a tu cuenta" variant="primary" size="lg" isLoading={false}  className="!rounded-3xl !text-xl w-full" />
                            <p className="text-base text-center text-foreground">
                                ¿No tiene una cuenta? <Link href="/auth/register" className="text-primary hover:underline">Regístrese acá</Link>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Círculo con información y decoración - Derecha */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 translate-x-1/2 font-primary">
                    <div className="w-[1620px] h-[1620px] flex flex-col justify-center items-start rounded-full border-4 border-primary bg-primary">
                        <p className="text-white w-1/2 font-semibold text-7xl text-right pl-50 pr-20">Juntos por la Justicia Social.</p>
                        <p className="text-white text-right w-1/2 text-4xl/8 pl-30 pr-20 mt-2">ODS 16 - Promoviendo la paz y la inclusión en Ciudad Guayana.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
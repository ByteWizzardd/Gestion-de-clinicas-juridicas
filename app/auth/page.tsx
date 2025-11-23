"use client";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
export default function AuthHome (){
    const router = useRouter();
    const handleLogin = () => {
        router.push("/auth/login");
    }
    const handleRegister = () => {
        router.push("/auth/register");
    }
    return(
        <div className="bg-background relative overflow-hidden h-screen">
            {/* Logo */}
            <div className="absolute top-4 left-0">
                <Image src="/image.png" alt="DER Logo" width={240} height={87} className="object-contain"/>
            </div>
            {/* Decoración 1 - Esquina superior derecha */}
            <motion.div 
                className="absolute top-[-10] right-0 z-0"
                initial={{ opacity: 0, x: 100, y: -100 }}
                animate={{ opacity: 1, x: 0, y: 0,}}
                transition={{ duration: 1.2,ease: "easeOut" }}>
                <Image src="/deco1.svg" alt="Decoración 1" width={600} height={600} className="object-contain"/>
            </motion.div>
            
            {/* Decoración 2 - Esquina inferior izquierda */}
            <motion.div 
                className="absolute bottom-[-10] left-0 z-0"
                initial={{ opacity: 0, x: -100, y: 100 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut"}}>
                <Image src="/deco2.svg" alt="Decoración 2" width={600} height={600} className="object-contain"/>
            </motion.div>
            {/* Contenedor centrado para la tarjeta */}
            <div className="flex h-screen justify-center items-center relative z-10">
                <div className="w-1/3 bg-[#FCFCFC] h-1/2 rounded-4xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col items-center justify-center p-5">
                    <div className="text-foreground text-center">
                        {/*Textos*/}
                        <p className="text-5xl font-semibold font-primary">
                            Clínica Jurídica
                        </p>
                        <p className="text-xl font-normal font-primary">
                            UCAB - Ext. Guayana
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 mt-10 w-full max-w-xs">
                        {/* Botones de Iniciar Sesión y Registrarse */}
                        <Button children="Iniciar sesion" variant="primary" size="lg" isLoading={false} className="!rounded-3xl !text-xl" onClick={handleLogin}/>
                        <Button children="Registrarse" variant="outline" size="lg" isLoading={false} className="!rounded-3xl !text-xl" onClick={handleRegister}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
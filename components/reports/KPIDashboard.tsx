'use client';

import {Target, SquareCheckBig, TriangleAlert} from 'lucide-react'

export default function KPIDashboard() {
    return (
        <div className="w-full relative font-primary">
            {/* Grid de 2 columnas para las cards superiores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                {/* Card 1: Casos Registrados y Demanda */}
                <div className="bg-neutral-50 rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] overflow-hidden relative p-6">
                    <div className="relative w-full">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-normal text-neutral-800 flex-1 pl-3 mt-4">Casos Registrados y Demanda</h3>
                            <div className="text-right flex-shrink-0 mr-8">
                                <div className="text-4xl font-medium text-neutral-800 mt-2">125 casos</div>
                                <div className="text-lg text-neutral-800/50 mt-2">+15% vs. Período Anterior</div>
                            </div>
                        </div>
                        <div className="h-0.5 bg-primary mb-4"></div>
                        <div className="text-lg text-neutral-800/50">Materia más común: Familiar (35%)</div>
                    </div>
                </div>

                {/* Card 2: Casos en Riesgo */}
                <div className="bg-neutral-50 rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] overflow-hidden relative p-6">
                    <div className="relative w-full">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-6">
                                <h3 className="text-2xl font-normal text-neutral-800 mb-3 mt-4">Casos en Riesgo</h3>
                                <div className="text-3xl font-medium text-neutral-800 relative z-10 whitespace-nowrap mr-1">12 Casos Inactivos</div>
                                <div className="text-lg text-neutral-800/50 leading-relaxed pr-20">Casos sin Acción registrada en más de 30 días o Estatus = En Pausa.</div>
                            </div>
                            <div className="relative flex-shrink-0">
                                {/* Icono triangular naranja semitransparente detrás del texto */}
                                <div className="absolute -top-8 right-0 translate-x-6 w-48 h-48 overflow-visible pointer-events-none flex items-center justify-center">
                                    <TriangleAlert className="w-full h-full text-secondary-light/30" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de 2 columnas para las cards inferiores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Card 3: Acciones Ejecutadas */}
                <div className="bg-neutral-50 rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] overflow-hidden relative p-6">
                    <div className="relative w-full">
                        <h3 className="text-2xl font-normal text-neutral-800 mb-3">Acciones Ejecutadas</h3>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 pr-6">
                                <div className="text-3xl font-medium text-neutral-800 mb-2">587 acciones</div>
                                <div className="text-lg text-neutral-800/50">Promedio por Caso: 4.7 Acciones</div>
                            </div>
                            <div className="absolute -top-1 right-4 w-48 h-48">
                                <SquareCheckBig className="w-full h-full text-secondary-light/30" strokeWidth={2} />
                            </div>
                        </div>
                        <div className="text-lg text-neutral-800/50  -mt-3">Total de acciones de seguimiento (bitácora, citas) registradas por el personal en el período.</div>
                    </div>
                </div>

                {/* Card 4: Tasa de Cierre Efectivo */}
                <div className="bg-neutral-50 rounded-3xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.30)] overflow-hidden relative p-6">
                    <div className="relative w-full">
                        <div className="flex-1 pr-32">
                            <h3 className="text-2xl font-normal text-neutral-800 mb-3">Tasa de Cierre Efectivo (Éxito)</h3>
                            <div className="text-lg text-neutral-800/50 mb-4">Casos Archivados: 94 | Pendientes de Cierre: 31</div>
                            <div className="text-lg text-neutral-800/50 leading-relaxed">
                                El principal indicador de cumplimiento: Porcentaje de casos concluidos satisfactoriamente sobre el total registrado en el TERM.
                            </div>
                        </div>
                        <div className="absolute top-0 right-6">
                            <div className="text-6xl font-medium text-neutral-800 relative z-10">75%</div>
                            <div className="absolute -top-1 right-0 w-48 h-48 overflow-visible pointer-events-none flex items-center justify-center">
                                <Target className="w-full h-full text-primary-light/30" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

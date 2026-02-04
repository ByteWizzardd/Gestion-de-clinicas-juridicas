export interface CasosGroupedData {
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    num_ambito_legal: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    nombre_ambito_legal: string;
    cantidad_casos: number;
}

export interface EstatusGroupedData {
    nombre_estatus: string;
    cantidad_casos: number;
}

export interface BeneficiariosGroupedData {
    tipo_beneficiario: string;
    id_materia: number;
    num_categoria: number;
    num_subcategoria: number;
    nombre_materia: string;
    nombre_categoria: string;
    nombre_subcategoria: string;
    cantidad_beneficiarios: number;
}

export interface SocioeconomicoData {
    distribucionPorTipoVivienda: Array<{ tipo_vivienda: string; cantidad_solicitantes: number }>;
    distribucionPorGenero: Array<{ genero: string; cantidad_solicitantes: number }>;
    distribucionPorEdad: Array<{ rango_edad: string; cantidad_solicitantes: number }>;
    distribucionPorEstadoCivil: Array<{ estado_civil: string; cantidad_solicitantes: number }>;
    distribucionPorNivelEducativo: Array<{ nivel_educativo: string; cantidad_solicitantes: number }>;
    distribucionLaboralFusionada: Array<{ categoria: string; cantidad_solicitantes: number }>;
    distribucionPorCondicionTrabajo: Array<{ condicion_trabajo: string; cantidad_solicitantes: number }>;
    distribucionPorCondicionActividad: Array<{ condicion_actividad: string; cantidad_solicitantes: number }>;
    distribucionPorIngresos: Array<{ rango_ingresos: string; cantidad_solicitantes: number }>;
    distribucionPorTamanoHogar: Array<{ tamano_hogar: string; cantidad_solicitantes: number }>;
    distribucionPorTrabajadoresHogar: Array<{ trabajadores_hogar: string; cantidad_solicitantes: number }>;
    distribucionPorDependientes: Array<{ cantidad_dependientes: string; cantidad_solicitantes: number }>;
    distribucionPorNinosHogar: Array<{ ninos_hogar: string; cantidad_solicitantes: number }>;
    distribucionPorHabitaciones: Array<{ cant_habitaciones: string; cantidad_solicitantes: number }>;
    distribucionPorBanos: Array<{ cant_banos: string; cantidad_solicitantes: number }>;
    distribucionPorCaracteristicasVivienda: Array<{
        nombre_tipo_caracteristica: string;
        caracteristica: string;
        cantidad_solicitantes: number
    }>;
}

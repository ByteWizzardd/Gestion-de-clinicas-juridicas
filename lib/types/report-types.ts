export interface Solicitante {
    cedula: string;
    nombres?: string;
    apellidos?: string;
    [key: string]: any;
}

export interface Caso {
    id_caso: number;
    tramite?: string;
    fecha_inicio_caso?: Date | string;
    [key: string]: any;
}

export interface SolicitanteFichaData {
    solicitante: Solicitante;
    casos?: Caso[];
    beneficiarios?: any[];
}

export interface CasoHistorialData {
    caso: Caso;
    acciones?: any[];
    citas?: any[];
    soportes?: any[];
    beneficiarios?: any[];
    equipo?: any[];
    cambiosEstatus?: any[];
}

'use client';

import { useState, useMemo } from 'react';
import CaseTools from "@/components/CaseTools/CaseTools";
import Table from "@/components/Table/Table";

interface NucleosClientProps {
    nucleos: any[];
}

export default function NucleosClient({ nucleos }: NucleosClientProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Transform data for table display
    const tableData = useMemo(() => {
        return nucleos.map((nucleo: any) => ({
            id_nucleo: nucleo.id_nucleo,
            nombre_nucleo: nucleo.nombre_nucleo,
            ubicacion: `${nucleo.nombre_parroquia}, ${nucleo.nombre_municipio}, ${nucleo.nombre_estado}`
        }));
    }, [nucleos]);

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery) return tableData;

        const query = searchQuery.toLowerCase();
        return tableData.filter((nucleo: any) =>
            nucleo.nombre_nucleo?.toLowerCase().includes(query) ||
            nucleo.ubicacion?.toLowerCase().includes(query) ||
            nucleo.id_nucleo?.toString().includes(query)
        );
    }, [tableData, searchQuery]);

    return (
        <>
            <CaseTools
                addLabel="Añadir Núcleo"
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <div className="mt-10"></div>
            <Table
                data={filteredData}
                columns={["Código", "Nombre de Núcleo", "Ubicación"]}
            />
        </>
    );
}

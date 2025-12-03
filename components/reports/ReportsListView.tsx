'use client';

import { FileDown, Eye } from 'lucide-react';
import Button from '../ui/Button';

interface GeneratedReport {
    id: string;
    type: string;
    generatedDate: string;
    parameters: string;
}

interface ReportsListViewProps {
    reports?: GeneratedReport[];
}

export default function ReportsListView({ reports = [] }: ReportsListViewProps) {
    if (reports.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-12 shadow-sm text-center">
                <FileDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay reportes generados</h3>
                <p className="text-base text-gray-500">
                    Los reportes que generes aparecerán aquí para su descarga y visualización.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Tipo de Reporte
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Fecha de Generación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Parámetros
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {reports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                                    {report.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">
                                    {report.generatedDate}
                                </td>
                                <td className="px-6 py-4 text-base text-gray-600">
                                    {report.parameters}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm">
                                            <Eye className="w-4 h-4 mr-1" />
                                            Ver
                                        </Button>
                                        <Button variant="primary" size="sm">
                                            <FileDown className="w-4 h-4 mr-1" />
                                            Descargar
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

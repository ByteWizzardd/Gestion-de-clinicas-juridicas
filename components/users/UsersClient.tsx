'use client';

import { useState, useMemo, useEffect } from 'react';
import CaseTools from '@/components/CaseTools/CaseTools';
import Table from '@/components/Table/Table';
import BulkUploadModal from './BulkUploadModal';
import { getUsuariosAction } from '@/app/actions/usuarios';

interface Usuario extends Record<string, unknown> {
  cedula: string;
  nombre_completo: string;
  correo_electronico: string;
  nombre_usuario: string;
  telefono_celular: string | null;
  habilitado_sistema: boolean;
  tipo_usuario: string;
  info_estudiante: string | null;
  info_profesor: string | null;
  info_coordinador: string | null;
}

interface UsersClientProps {
  initialUsuarios?: Usuario[];
}

export default function UsersClient({ initialUsuarios = [] }: UsersClientProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar usuarios al montar el componente si no hay datos iniciales
  useEffect(() => {
    if (initialUsuarios.length === 0) {
      loadUsuarios();
    }
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const result = await getUsuariosAction();
      if (result.success && result.data) {
        setUsuarios(result.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar opciones de tipo de usuario
  const tipoOptions = useMemo(() => {
    const tipos = new Set<string>();
    usuarios.forEach(u => {
      if (u.tipo_usuario) {
        tipos.add(u.tipo_usuario);
      }
    });
    return Array.from(tipos).map(tipo => ({
      value: tipo,
      label: tipo
    }));
  }, [usuarios]);

  // Función para normalizar texto removiendo acentos
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Filtrar usuarios
  const filteredUsuarios = useMemo(() => {
    if (!searchValue && !tipoFilter) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      const normalizedSearch = normalizeText(searchValue);
      const matchesSearch = 
        !searchValue ||
        usuario.cedula.includes(searchValue) ||
        normalizeText(usuario.nombre_completo || '').includes(normalizedSearch) ||
        normalizeText(usuario.correo_electronico || '').includes(normalizedSearch) ||
        normalizeText(usuario.nombre_usuario || '').includes(normalizedSearch) ||
        (usuario.telefono_celular && normalizeText(usuario.telefono_celular).includes(normalizedSearch));

      const matchesTipo = !tipoFilter || usuario.tipo_usuario === tipoFilter;

      return matchesSearch && matchesTipo;
    });
  }, [usuarios, searchValue, tipoFilter]);

  const handleView = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    alert(`Ver detalles de: ${usuario.nombre_completo}`);
  };

  const handleEdit = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    alert(`Editar usuario: ${usuario.nombre_completo}`);
  };

  const handleDelete = (data: Record<string, unknown>) => {
    const usuario = data as Usuario;
    const confirmDelete = window.confirm(
      `¿Está seguro de que desea eliminar al usuario ${usuario.nombre_completo}?`
    );
    if (confirmDelete) {
      alert(`Eliminar usuario: ${usuario.nombre_completo}`);
    }
  };

  const handleBulkUploadSuccess = () => {
    loadUsuarios();
  };

  // Formatear información adicional para mostrar en la tabla
  const formatInfo = (usuario: Usuario): string => {
    if (usuario.tipo_usuario === 'Estudiante' && usuario.info_estudiante) {
      return usuario.info_estudiante;
    }
    if (usuario.tipo_usuario === 'Profesor' && usuario.info_profesor) {
      return usuario.info_profesor;
    }
    if (usuario.tipo_usuario === 'Coordinador' && usuario.info_coordinador) {
      return usuario.info_coordinador;
    }
    return '-';
  };

  return (
    <>
      <h1 className="text-4xl m-3 font-semibold font-primary">Gestión de Usuarios</h1>
      <p className="mb-6 ml-3">
        Administración de usuarios del sistema: estudiantes, profesores y coordinadores
      </p>
      
      <CaseTools 
        addLabel="Cargar Estudiantes por Lotes" 
        onAddClick={() => setIsBulkUploadModalOpen(true)}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        estatusFilter={tipoFilter}
        onEstatusChange={setTipoFilter}
        estatusOptions={tipoOptions}
        tramiteFilter=""
        onTramiteChange={() => {}}
        tramiteOptions={[]}
      />
      
      <div className="mt-10"></div>

      {loading ? (
        <div className="m-3 p-4 text-center">
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      ) : (
        <Table
          data={filteredUsuarios.map((u) => ({
            cedula: u.cedula,
            nombre_completo: u.nombre_completo,
            correo_electronico: u.correo_electronico,
            nombre_usuario: u.nombre_usuario,
            telefono_celular: u.telefono_celular || 'N/A',
            tipo_usuario: u.tipo_usuario,
            estado: u.habilitado_sistema ? 'Habilitado' : 'Deshabilitado',
            informacion: formatInfo(u),
          }))}
          columns={["Cédula", "Nombre Completo", "Correo", "Usuario", "Teléfono", "Tipo", "Estado", "Información"]}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        onSuccess={handleBulkUploadSuccess}
      />
    </>
  );
}


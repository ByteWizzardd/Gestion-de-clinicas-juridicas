'use client';

import { useState } from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import type { UserRole } from '../../components/sidebar/menu-config';
import Notification from '../../components/ui/Notification';
import DateTime from '../../components/ui/DateTime';
import ApplicantFormModal from '../../components/ui/ApplicantFormModal';
import CaseFormModal from '../../components/ui/CaseFormModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Rol de usuario, por ahora se usa student pero para pruebas se puede cambiar este valor a admin o professor
  const userRole: UserRole = 'student';
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  const handleCloseApplicantModal = () => {
    setIsApplicantModalOpen(false);
  };

  const handleCloseCaseModal = () => {
    setIsCaseModalOpen(false);
  };

  const handleSubmitApplicant = (data: any) => {
    console.log('Datos del solicitante:', data);
    // Aquí procesarías los datos, por ejemplo, enviarlos a una API
  };

  const handleSubmitCase = (data: any) => {
    console.log('Datos del caso:', data);
    // Aquí procesarías los datos, por ejemplo, enviarlos a una API
  };

  return (
    <div className="flex h-screen bg-background relative">
      <div className="flex-shrink-0">
        <Sidebar role={userRole} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="absolute top-6 right-6 flex items-center gap-4 z-10 text-lg">
          <Notification count={3}/>
          <DateTime />
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>

      {/* Modal de Registro de Solicitante */}
      <ApplicantFormModal
        isOpen={isApplicantModalOpen}
        onClose={handleCloseApplicantModal}
        onSubmit={handleSubmitApplicant}
      />

      {/* Modal de Registro de Caso */}
      <CaseFormModal
        isOpen={isCaseModalOpen}
        onClose={handleCloseCaseModal}
        onSubmit={handleSubmitCase}
      />
    </div>
  );
}
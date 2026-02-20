'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: '¿Cómo puedo crear un nuevo caso?',
    answer: 'Para crear un nuevo caso, dirígete a la sección "Casos" en el menú lateral y haz clic en el botón "Nuevo Caso". Completa el formulario con la información del solicitante y los detalles del caso legal. Asegúrate de llenar todos los campos obligatorios marcados con asterisco (*).',
  },
  {
    id: '2',
    question: '¿Cómo agendo una cita con un solicitante?',
    answer: 'Puedes agendar una cita desde la sección "Citas" en el menú lateral o desde el detalle de un caso en la pestaña "Citas". Haz clic en "Nueva Cita", selecciona el caso, la fecha y los estudiantes que atenderán. Nota: la fecha de la cita debe ser igual o posterior a la fecha actual.',
  },
  {
    id: '3',
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Puedes cambiar tu contraseña desde tu perfil. Haz clic en tu foto de perfil en el sidebar, selecciona "Cambiar contraseña" y completa el formulario con tu contraseña actual y la nueva contraseña. La nueva contraseña debe tener al menos 6 caracteres.',
  },
  {
    id: '4',
    question: '¿Qué información puedo ver en los reportes?',
    answer: 'Los reportes te permiten visualizar estadísticas sobre casos, solicitantes y actividades de la clínica. Puedes generar reportes por estatus de casos, tipos de casos, información socioeconómica de solicitantes, y más. Los reportes se pueden exportar en formato PDF y DOCX. Nota: solo coordinadores y profesores tienen acceso a esta sección.',
  },
  {
    id: '5',
    question: '¿Cómo registro un nuevo solicitante?',
    answer: 'Ve a la sección "Solicitantes" y haz clic en "Nuevo Solicitante". El formulario tiene varios pasos donde deberás ingresar información personal, datos socioeconómicos, información de vivienda y familia. El progreso se guarda automáticamente para que puedas continuar más tarde si cierras el formulario.',
  },
  {
    id: '6',
    question: '¿Puedo editar mi información personal?',
    answer: 'Los usuarios normales no pueden editar su información personal directamente, ya que los datos son gestionados por el sistema. Si necesitas actualizar tu información, contacta al coordinador de la clínica. Sin embargo, puedes cambiar tu contraseña y foto de perfil desde tu perfil.',
  },
  {
    id: '7',
    question: '¿Cómo filtro los casos?',
    answer: 'En la página de casos, puedes usar la barra de búsqueda para buscar por número de caso, nombre del solicitante o cédula. También puedes usar los filtros disponibles para buscar por estatus, núcleo, materia, trámite, o ver solo tus casos asignados.',
  },
  {
    id: '8',
    question: '¿Qué roles existen en el sistema?',
    answer: 'El sistema tiene tres roles principales: Coordinador (puede gestionar usuarios, catálogos, auditoría y tiene acceso completo), Profesor (puede gestionar su equipo de estudiantes y casos asignados), y Estudiante (puede ver y trabajar con casos asignados a su equipo). Cada rol tiene permisos específicos según su función.',
  },
  {
    id: '9',
    question: '¿Cómo subo mi foto de perfil?',
    answer: 'Ve a tu perfil haciendo clic en tu foto en el sidebar y selecciona "Perfil". Pasa el mouse sobre tu foto de perfil (o el icono si no tienes foto) y aparecerá un icono de edición. Haz clic y selecciona "Subir foto" para elegir una imagen desde tu dispositivo.',
  },
  {
    id: '10',
    question: '¿Qué hago si olvidé mi contraseña?',
    answer: 'Si olvidaste tu contraseña, en la página de inicio de sesión haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico y recibirás un código de verificación por email. Luego podrás establecer una nueva contraseña.',
  },
  {
    id: '11',
    question: '¿Cómo agrego beneficiarios a un caso?',
    answer: 'Dentro del detalle de un caso, ve a la pestaña "Beneficiarios" y haz clic en "Agregar Beneficiario". Completa el formulario con los datos del beneficiario incluyendo nombres, apellidos, fecha de nacimiento, sexo, tipo de beneficiario (directo o indirecto) y su parentesco con el solicitante.',
  },
  {
    id: '12',
    question: '¿Cómo registro una acción o actuación en un caso?',
    answer: 'En el detalle del caso, ve a la pestaña "Acciones" y haz clic en "Nueva Acción". Selecciona el tipo de acción, la fecha de ejecución, descripción y los estudiantes ejecutores. Las acciones permiten documentar todas las actividades realizadas en el caso.',
  },
  {
    id: '13',
    question: '¿Cómo funcionan las notificaciones?',
    answer: 'El sistema envía notificaciones cuando te asignan a un caso o cita, cuando hay actualizaciones importantes, o cuando se requiere tu atención. Puedes ver tus notificaciones haciendo clic en el icono de campana en la esquina superior derecha. Las notificaciones no leídas se muestran con un indicador numérico.',
  },
  {
    id: '14',
    question: '¿Qué es la sección de Auditoría?',
    answer: 'La Auditoría es una sección disponible solo para coordinadores que permite ver un registro histórico de todas las acciones realizadas en el sistema: creación, modificación y eliminación de usuarios, casos, solicitantes, beneficiarios, acciones y más. Es útil para supervisar la actividad y mantener un control de cambios.',
  },
  {
    id: '15',
    question: '¿Cómo funciona la Gestión de Equipo para profesores?',
    answer: 'Los profesores pueden gestionar su equipo de estudiantes desde la sección "Gestión de Equipo". Allí pueden ver los estudiantes asignados a su grupo, inscribir nuevos estudiantes o removerlos. Los estudiantes del equipo pueden trabajar en los casos asignados al profesor.',
  },
  {
    id: '16',
    question: '¿Qué muestra el Dashboard?',
    answer: 'El Dashboard muestra un resumen de la actividad: estadísticas de casos por estatus, últimas citas programadas, casos recientes, y métricas clave. Para coordinadores, muestra datos globales; para profesores y estudiantes, muestra información relevante a sus casos asignados.',
  },
  {
    id: '17',
    question: '¿Cómo edito un solicitante existente?',
    answer: 'Ve a la sección "Solicitantes", busca al solicitante que deseas editar y haz clic en él para ver su detalle. Luego usa el botón "Editar" para modificar su información. Todos los campos del formulario de registro están disponibles para edición.',
  },

];

export default function HelpClient() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const breadcrumbItems = useMemo(() => [
    { label: 'Perfil', href: '/dashboard/profile' },
    { label: 'Preguntas frecuentes' },
  ], []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <Breadcrumbs items={breadcrumbItems} />
      </motion.div>

      <motion.h1
        className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 mt-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        Preguntas Frecuentes
      </motion.h1>

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-primary" />
          <p className="text-gray-600 text-sm sm:text-base">
            Encuentra respuestas a las preguntas más comunes sobre el uso del sistema de gestión de clínica jurídica.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">
                  {faq.question}
                </span>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>


      </motion.div>
    </div>
  );
}

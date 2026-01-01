'use client';

import { useState } from 'react';
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
    answer: 'Puedes agendar una cita desde la sección "Citas" en el menú lateral. Haz clic en "Nueva Cita" y selecciona el solicitante, la fecha, hora y el tipo de consulta. El sistema te mostrará los horarios disponibles según la programación de consultas configurada.',
  },
  {
    id: '3',
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Puedes cambiar tu contraseña desde tu perfil. Haz clic en tu foto de perfil en el sidebar, selecciona "Cambiar contraseña" y completa el formulario con tu contraseña actual y la nueva contraseña. La nueva contraseña debe tener al menos 6 caracteres.',
  },
  {
    id: '4',
    question: '¿Qué información puedo ver en los reportes?',
    answer: 'Los reportes te permiten visualizar estadísticas sobre casos, solicitantes y actividades de la clínica. Puedes generar reportes por estatus de casos, tipos de casos, información socioeconómica de solicitantes, y más. Los reportes se pueden exportar en formato PDF y DOCX.',
  },
  {
    id: '5',
    question: '¿Cómo registro un nuevo solicitante?',
    answer: 'Ve a la sección "Solicitantes" y haz clic en "Nuevo Solicitante". El formulario tiene varios pasos donde deberás ingresar información personal, datos socioeconómicos, información de vivienda y familia. Puedes guardar el progreso y continuar más tarde si es necesario.',
  },
  {
    id: '6',
    question: '¿Puedo editar mi información personal?',
    answer: 'Los usuarios normales no pueden editar su información personal directamente, ya que los datos son gestionados por el sistema. Si necesitas actualizar tu información, contacta al coordinador de la clínica. Sin embargo, puedes cambiar tu contraseña y foto de perfil desde tu perfil.',
  },
  {
    id: '7',
    question: '¿Cómo filtro los casos?',
    answer: 'En la página de casos, puedes usar la barra de búsqueda para buscar por número de caso, nombre del solicitante o cédula. También puedes usar los filtros disponibles para buscar por estatus, categoría, materia, o rango de fechas.',
  },
  {
    id: '8',
    question: '¿Qué roles existen en el sistema?',
    answer: 'El sistema tiene tres roles principales: Coordinador (puede gestionar usuarios, catálogos y tiene acceso completo), Profesor (puede gestionar su equipo y casos asignados), y Estudiante (puede ver y trabajar con casos asignados). Cada rol tiene permisos específicos según su función.',
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
];

export default function HelpClient() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Breadcrumbs
          items={[
            { label: 'Perfil', href: '/dashboard/profile' },
            { label: 'Preguntas frecuentes' },
          ]}
        />
      </motion.div>

      <motion.h1
        className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 sm:mb-8 mt-4"
        style={{ fontFamily: 'var(--font-league-spartan)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Preguntas Frecuentes
      </motion.h1>

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-primary" />
          <p className="text-gray-600 text-sm sm:text-base">
            Encuentra respuestas a las preguntas más comunes sobre el uso del sistema de gestión de clínicas jurídicas.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
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

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            ¿No encuentras la respuesta que buscas?
          </p>
          <p className="text-sm text-gray-500">
            Contacta al equipo de soporte en:{' '}
            <a 
              href="mailto:soporte@clinicasjuridicas.com" 
              className="text-primary hover:underline"
            >
              soporte@clinicasjuridicas.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

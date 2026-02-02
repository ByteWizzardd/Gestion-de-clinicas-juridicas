'use client';

import React from 'react';
import InputGroup from './InputGroup';

// Lista de códigos de país ampliada
const phoneCodes = [
  { value: '+58', label: '+58' }, // Venezuela
  { value: '+1', label: '+1' },   // Estados Unidos/Canadá
  { value: '+52', label: '+52' }, // México
  { value: '+57', label: '+57' }, // Colombia
  { value: '+51', label: '+51' }, // Perú
  { value: '+56', label: '+56' }, // Chile
  { value: '+54', label: '+54' }, // Argentina
  { value: '+55', label: '+55' }, // Brasil
  { value: '+593', label: '+593' },// Ecuador
  { value: '+595', label: '+595' },// Paraguay
  { value: '+598', label: '+598' },// Uruguay
  { value: '+591', label: '+591' },// Bolivia
  { value: '+34', label: '+34' }, // España
];

interface PhoneInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
  required?: boolean;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
}) => {
  // Lógica mejorada para extraer el código y el número
  // Formato esperado: "+58-4122727981" o "+584122727981"
  let code = '+58'; // Código por defecto
  let number = '';

  // Primero, verificar si tiene formato con guión (+58-...)
  const dashMatch = value.match(/^(\+\d{1,4})-(.*)$/);
  if (dashMatch) {
    code = dashMatch[1];
    number = dashMatch[2].replace(/\D/g, ''); // Solo números
  } else {
    // Buscar el código de país más largo que coincida con el inicio del valor
    const matchingCode = phoneCodes
      .map(pc => pc.value)
      .sort((a, b) => b.length - a.length) // Ordenar de más largo a más corto
      .find(c => value.startsWith(c));

    if (matchingCode) {
      code = matchingCode;
      number = value.substring(matchingCode.length).replace(/\D/g, '');
    } else if (value.startsWith('+')) {
      // Si empieza con + pero no coincide con ningún código conocido
      const codeMatch = value.match(/^(\+\d{1,4})/);
      if (codeMatch) {
        code = codeMatch[1];
        number = value.substring(codeMatch[1].length).replace(/\D/g, '');
      }
    }
  }

  const handleCodeChange = (newCode: string) => {
    // Siempre guardar con guión
    const newValue = `${newCode}-${number}`;
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleNumberChange = (newNumber: string) => {
    // Siempre guardar con guión
    const newValue = `${code}-${newNumber}`;
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <InputGroup
      label={required ? `${label} *` : label}
      selectValue={code}
      selectOptions={phoneCodes}
      onSelectChange={handleCodeChange}
      inputValue={number}
      onInputChange={handleNumberChange}
      inputPlaceholder={placeholder}
      error={error ?? undefined}
      numbersOnly
      disabled={disabled}
      selectWidth="w-20"
      editableCode={true}
    />
  );
};

export default PhoneInput;

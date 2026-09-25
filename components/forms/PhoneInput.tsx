'use client';

import React from 'react';
import InputGroup from './InputGroup';
import { PHONE_CODES, parsePhone } from '@/lib/utils/phone';

const phoneCodes = PHONE_CODES.map((c) => ({ value: c, label: c }));

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
  // Acepta cualquier formato guardado ("+58-412…", "0412…", "+58412…")
  const { code, number } = parsePhone(value);

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

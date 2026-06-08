import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Button from '../atoms/Button';
import { BottomSheet, FIELD_CONTROL_CLASS, FieldShell, cn } from './fieldShared';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  label: string;
  value?: string | null;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  containerClassName?: string;
  onChange: (value: string) => void;
}

export function SelectField({
  label,
  value,
  options,
  placeholder = 'Selecciona una opción',
  helperText,
  errorText,
  disabled = false,
  containerClassName,
  onChange,
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  return (
    <>
      <FieldShell
        active={isOpen}
        className={containerClassName}
        disabled={disabled}
        errorText={errorText}
        helperText={helperText}
        label={label}
      >
        <Pressable
          accessibilityRole="button"
          className={cn(
            FIELD_CONTROL_CLASS,
            'flex-row items-center justify-between gap-3',
          )}
          disabled={disabled}
          onPress={() => setIsOpen(true)}
        >
          <Text
            className={cn(
              'flex-1 font-body text-body',
              selectedOption ? 'text-primary' : 'text-med-gray',
            )}
          >
            {selectedOption?.label ?? placeholder}
          </Text>
          <Ionicons
            color="#6B7280"
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
          />
        </Pressable>
      </FieldShell>

      <BottomSheet
        onClose={() => setIsOpen(false)}
        title={label}
        visible={isOpen}
        footer={
          <Button
            className="bg-secondary"
            title="Cerrar"
            variant="secondary"
            onPress={() => setIsOpen(false)}
          />
        }
      >
        <View className="gap-3">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <Pressable
                key={option.value}
                className={cn(
                  'rounded-lg border px-4 py-2',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-light-gray bg-[#F8F7FA]',
                )}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  className={cn(
                    'font-body text-base',
                    isSelected ? 'text-white' : 'text-primary',
                  )}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

export default SelectField;

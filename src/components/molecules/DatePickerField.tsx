import { useMemo, useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  FIELD_CONTROL_CLASS,
  FIELD_PLACEHOLDER_CLASS,
  FieldShell,
  cn,
} from './fieldShared';

export interface DatePickerFieldProps {
  label: string;
  value?: Date | null;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  containerClassName?: string;
  minimumYear?: number;
  maximumYear?: number;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (value: Date) => void;
}

function formatDate(date?: Date | null) {
  if (!date) return '';

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clampDate(date: Date, minimumDate: Date, maximumDate: Date) {
  const normalized = normalizeDate(date);
  if (normalized < minimumDate) return minimumDate;
  if (normalized > maximumDate) return maximumDate;
  return normalized;
}

export function DatePickerField({
  label,
  value,
  helperText,
  errorText,
  disabled = false,
  containerClassName,
  minimumYear = 1940,
  maximumYear = new Date().getFullYear(),
  minimumDate: minimumDateProp,
  maximumDate: maximumDateProp,
  onChange,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { minimumDate, maximumDate } = useMemo(() => {
    const firstYear = Math.min(minimumYear, maximumYear);
    const lastYear = Math.max(minimumYear, maximumYear);
    const firstDate = minimumDateProp
      ? normalizeDate(minimumDateProp)
      : new Date(firstYear, 0, 1);
    const lastDate = maximumDateProp
      ? normalizeDate(maximumDateProp)
      : new Date(lastYear, 11, 31);

    return {
      minimumDate: firstDate <= lastDate ? firstDate : lastDate,
      maximumDate: firstDate <= lastDate ? lastDate : firstDate,
    };
  }, [maximumDateProp, maximumYear, minimumDateProp, minimumYear]);
  const pickerDate = clampDate(value ?? new Date(), minimumDate, maximumDate);

  const handleConfirm = (selectedDate: Date) => {
    setIsOpen(false);
    onChange(normalizeDate(selectedDate));
  };

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
          accessibilityHint="Abre el selector de fecha"
          accessibilityLabel={label}
          accessibilityRole="button"
          className={cn(FIELD_CONTROL_CLASS, 'justify-center')}
          disabled={disabled}
          onPress={() => setIsOpen(true)}
        >
          <Text
            className={cn(
              'font-body text-base',
              value ? 'text-primary dark:text-[#F7F2FB]' : FIELD_PLACEHOLDER_CLASS,
            )}
          >
            {formatDate(value) || 'DD/MM/AAAA'}
          </Text>
        </Pressable>
      </FieldShell>

      <DateTimePickerModal
        cancelTextIOS="Cancelar"
        confirmTextIOS="Guardar"
        date={pickerDate}
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        isVisible={isOpen}
        locale="es-MX"
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        mode="date"
        onCancel={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

export default DatePickerField;

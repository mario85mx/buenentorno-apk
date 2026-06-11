import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Button from '../atoms/Button';
import {
  BottomSheet,
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
  onChange: (value: Date) => void;
}

const monthOptions = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function formatDate(date?: Date | null) {
  if (!date) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}/${month}/${year}`;
}

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
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
  onChange,
}: DatePickerFieldProps) {
  const initialValue = value ?? new Date(1990, 0, 1);
  const [isOpen, setIsOpen] = useState(false);
  const [draftDay, setDraftDay] = useState(initialValue.getDate());
  const [draftMonth, setDraftMonth] = useState(initialValue.getMonth() + 1);
  const [draftYear, setDraftYear] = useState(initialValue.getFullYear());

  const years = useMemo(() => {
    const output: number[] = [];

    for (let current = maximumYear; current >= minimumYear; current -= 1) {
      output.push(current);
    }

    return output;
  }, [maximumYear, minimumYear]);

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(draftMonth, draftYear);

    return Array.from({ length: totalDays }, (_, index) => index + 1);
  }, [draftMonth, draftYear]);

  useEffect(() => {
    setDraftDay((current) => Math.min(current, getDaysInMonth(draftMonth, draftYear)));
  }, [draftMonth, draftYear]);

  const displayValue = formatDate(value);

  const openPicker = () => {
    const nextValue = value ?? new Date(1990, 0, 1);
    setDraftDay(nextValue.getDate());
    setDraftMonth(nextValue.getMonth() + 1);
    setDraftYear(nextValue.getFullYear());
    setIsOpen(true);
  };

  const confirmSelection = () => {
    const boundedDay = Math.min(
      draftDay,
      getDaysInMonth(draftMonth, draftYear),
    );
    onChange(new Date(draftYear, draftMonth - 1, boundedDay));
    setIsOpen(false);
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
          accessibilityRole="button"
          className={cn(FIELD_CONTROL_CLASS, 'justify-center')}
          disabled={disabled}
          onPress={openPicker}
        >
          <Text
            className={cn(
              'font-body text-base',
              value ? 'text-primary' : FIELD_PLACEHOLDER_CLASS,
            )}
          >
            {displayValue || 'DD/MM/AAAA'}
          </Text>
        </Pressable>
      </FieldShell>

      <BottomSheet
        onClose={() => setIsOpen(false)}
        title={label}
        visible={isOpen}
        footer={
          <View className="flex-row gap-3">
            <Button
              className="flex-1 bg-white"
              textClassName="text-primary"
              title="Cancelar"
              variant="secondary"
              onPress={() => setIsOpen(false)}
            />
            <Button
              className="flex-1"
              title="Guardar"
              onPress={confirmSelection}
            />
          </View>
        }
      >
        <View className="flex-row gap-3">
          <PickerColumn
            label="Día"
            onSelect={setDraftDay}
            options={days}
            selectedValue={draftDay}
          />
          <PickerColumn
            label="Mes"
            onSelect={setDraftMonth}
            options={monthOptions.map((_, index) => index + 1)}
            renderValue={(option) => monthOptions[option - 1]}
            selectedValue={draftMonth}
          />
          <PickerColumn
            label="Año"
            onSelect={setDraftYear}
            options={years}
            selectedValue={draftYear}
          />
        </View>
      </BottomSheet>
    </>
  );
}

interface PickerColumnProps {
  label: string;
  options: number[];
  selectedValue: number;
  onSelect: (value: number) => void;
  renderValue?: (value: number) => string;
}

function PickerColumn({
  label,
  options,
  selectedValue,
  onSelect,
  renderValue,
}: PickerColumnProps) {
  return (
    <View className="flex-1">
      <Text className="mb-3 px-1 font-body-semibold text-sm uppercase tracking-[0.8px] text-med-gray">
        {label}
      </Text>
      <ScrollView
        className="h-72 rounded-lg bg-[#F6F3FA] p-2"
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => {
          const isSelected = option === selectedValue;

          return (
            <Pressable
              key={`${label}-${option}`}
              className={cn(
                'rounded-lg px-3 py-3',
                isSelected && 'bg-primary',
              )}
              onPress={() => onSelect(option)}
            >
              <Text
                className={cn(
                  'text-center font-body text-base',
                  isSelected ? 'text-white' : 'text-primary',
                )}
              >
                {renderValue ? renderValue(option) : option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default DatePickerField;

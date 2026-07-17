import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  FIELD_CONTROL_CLASS,
  FIELD_PLACEHOLDER_CLASS,
  FieldShell,
  cn,
} from './fieldShared';

type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

export interface TimePickerFieldProps {
  label: string;
  value?: string | null;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  containerClassName?: string;
  minuteInterval?: MinuteInterval;
  onChange: (value: string) => void;
}

function parseTime(value?: string | null) {
  const now = new Date();
  const [hoursText, minutesText] = value?.split(':') ?? [];
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  ) {
    now.setHours(hours, minutes, 0, 0);
  } else {
    now.setSeconds(0, 0);
  }

  return now;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

export function TimePickerField({
  label,
  value,
  helperText,
  errorText,
  disabled = false,
  containerClassName,
  minuteInterval = 30,
  onChange,
}: TimePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = (selectedTime: Date) => {
    // Hide first to avoid the Android picker opening twice.
    setIsOpen(false);
    onChange(formatTime(selectedTime));
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
          accessibilityHint="Abre el selector de hora"
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
            {value || 'HH:MM'}
          </Text>
        </Pressable>
      </FieldShell>

      <DateTimePickerModal
        cancelTextIOS="Cancelar"
        confirmTextIOS="Guardar"
        date={parseTime(value)}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        is24Hour
        isVisible={isOpen}
        locale="es-MX"
        minuteInterval={minuteInterval}
        mode="time"
        onCancel={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        timePickerModeAndroid="clock"
      />
    </>
  );
}

export default TimePickerField;

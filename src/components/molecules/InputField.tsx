import { forwardRef, useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { FIELD_CONTROL_CLASS, FieldShell, cn } from './fieldShared';

export interface InputFieldProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      value,
      defaultValue,
      helperText,
      errorText,
      editable = true,
      containerClassName,
      className,
      onFocus,
      onBlur,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <FieldShell
        active={isFocused}
        className={containerClassName}
        disabled={!editable}
        errorText={errorText}
        helperText={helperText}
        label={label}
      >
        <TextInput
          ref={ref}
          className={cn(
            FIELD_CONTROL_CLASS,
            'font-body text-body text-primary',
            className,
          )}
          editable={editable}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor="#9CA3AF"
          selectionColor="#18052E"
          value={value}
          {...props}
          placeholder={placeholder}
        />
      </FieldShell>
    );
  },
);

InputField.displayName = 'InputField';

export default InputField;

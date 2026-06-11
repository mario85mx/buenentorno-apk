import { forwardRef, useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import {
  FIELD_CONTROL_CLASS,
  FIELD_INPUT_CLASS,
  FIELD_PLACEHOLDER_CLASS,
  FIELD_PLACEHOLDER_COLOR,
  FieldShell,
  cn,
} from './fieldShared';

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
        <View className={FIELD_CONTROL_CLASS}>
          <TextInput
            ref={ref}
            className={cn(
              FIELD_INPUT_CLASS,
              !value && !defaultValue && FIELD_PLACEHOLDER_CLASS,
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
            placeholderTextColor={FIELD_PLACEHOLDER_COLOR}
            selectionColor="#18052E"
            textAlignVertical="center"
            value={value}
            {...props}
            placeholder={placeholder}
          />
        </View>
      </FieldShell>
    );
  },
);

InputField.displayName = 'InputField';

export default InputField;

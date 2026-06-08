import { FontAwesome } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { Pressable, TextInput, TextInputProps, View } from 'react-native';
import { FIELD_CONTROL_CLASS, FieldShell, cn } from './fieldShared';

export interface PasswordInputFieldProps extends TextInputProps {
  label: string;
  helperText?: string;
  errorText?: string;
  containerClassName?: string;
}

export const PasswordInputField = forwardRef<TextInput, PasswordInputFieldProps>(
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
    const [isVisible, setIsVisible] = useState(false);

    return (
      <FieldShell
        active={isFocused}
        className={containerClassName}
        disabled={!editable}
        errorText={errorText}
        helperText={helperText}
        label={label}
      >
        <View className={cn(FIELD_CONTROL_CLASS, 'flex-row items-center gap-3')}>
          <TextInput
            ref={ref}
            className={cn(
              'flex-1 font-body text-body text-primary',
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
            secureTextEntry={!isVisible}
            selectionColor="#18052E"
            value={value}
            {...props}
            placeholder={placeholder}
          />

          <Pressable
            accessibilityLabel={isVisible ? 'Ocultar password' : 'Mostrar password'}
            className="rounded-lg p-1"
            disabled={!editable}
            onPress={() => setIsVisible((current) => !current)}
          >
            <FontAwesome
              color={editable ? '#6B7280' : '#9CA3AF'}
              name={isVisible ? 'eye-slash' : 'eye'}
              size={18}
            />
          </Pressable>
        </View>
      </FieldShell>
    );
  },
);

PasswordInputField.displayName = 'PasswordInputField';

export default PasswordInputField;

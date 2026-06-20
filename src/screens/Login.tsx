import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import InputField from '../components/molecules/InputField';
import PasswordInputField from '../components/molecules/PasswordInputField';
import AuthShell from '../components/organisms/AuthShell';
import { getErrorMessage } from '../services/error';
import type { LoginPayload } from '../services/types';

export interface LoginProps {
  onLogin?: (payload: LoginPayload) => Promise<void>;
  onOpenRecovery?: () => void;
}

export default function Login({ onLogin, onOpenRecovery }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !onLogin) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onLogin({
        email: email.trim(),
        password,
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'No fue posible iniciar sesión.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      subtitle="Ingresa con tus credenciales para acceder a tu panel de residente."
      title="Iniciar sesion"
      footer={
        <View className="gap-3">
          <View className="flex-row items-center justify-center gap-1">
            <Text className="font-body text-sm text-med-gray">
              ¿No recuerdas tu contraseña?
            </Text>
            <Pressable onPress={onOpenRecovery}>
              <Text className="font-body-semibold text-sm text-accent">
                Recuperarla
              </Text>
            </Pressable>
          </View>

          <Text className="text-center font-body text-xs leading-5 text-med-gray">
            Tu acceso esta protegido y vinculado a la cuenta registrada por la
            administracion.
          </Text>
        </View>
      }
    >
      <InputField
        autoCapitalize="none"
        autoCorrect={false}
        errorText={errorMessage ? ' ' : undefined}
        keyboardType="email-address"
        label="Correo electronico"
        placeholder="residente@buenentorno.mx"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
      />

      <PasswordInputField
        autoCapitalize="none"
        autoCorrect={false}
        errorText={errorMessage}
        label="Contraseña"
        placeholder="Tu contraseña"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (errorMessage) {
            setErrorMessage('');
          }
        }}
      />

      <View className="items-end">
        <Pressable onPress={onOpenRecovery}>
          <Text className="font-body-semibold text-sm text-primary">
            Olvide mi contraseña
          </Text>
        </Pressable>
      </View>

      <Button
        disabled={!canSubmit}
        loading={isSubmitting}
        size="lg"
        title="Entrar"
        onPress={() => {
          void handleSubmit();
        }}
      />
    </AuthShell>
  );
}

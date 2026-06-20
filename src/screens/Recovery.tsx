import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import InputField from '../components/molecules/InputField';
import AuthShell from '../components/organisms/AuthShell';
import { getErrorMessage } from '../services/error';

export interface RecoveryProps {
  onBack?: () => void;
  onSubmit?: (email: string) => Promise<{ accepted: boolean; debugResetUrl?: string }>;
}

export default function Recovery({ onBack, onSubmit }: RecoveryProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [debugResetUrl, setDebugResetUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = email.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !onSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const response = await onSubmit(email.trim());
      setDebugResetUrl(response.debugResetUrl ?? null);
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'No fue posible enviar la recuperación.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      subtitle="Te enviaremos instrucciones al correo asociado para restablecer tu acceso."
      title="Recuperar acceso"
      footer={
        <View className="items-center">
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-2 rounded-full px-2 py-1"
            onPress={onBack}
          >
            <Ionicons color="#18052E" name="arrow-back" size={16} />
            <Text className="font-body-semibold text-sm text-primary">
              Volver a inicio de sesion
            </Text>
          </Pressable>
        </View>
      }
    >
      {submitted ? (
        <View className="gap-4 rounded-3xl border border-[#DDE8D5] bg-[#F4F8F1] px-5 py-5">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-success">
            <Ionicons color="#FFFFFF" name="mail-outline" size={22} />
          </View>
          <View className="gap-2">
            <Text className="font-heading text-xl text-primary">
              Revisa tu correo
            </Text>
            <Text className="font-body text-base leading-6 text-dark-gray">
              Enviamos las instrucciones de recuperacion a {email}.
            </Text>
            {debugResetUrl ? (
              <Text className="font-body text-sm leading-6 text-med-gray">
                URL de recuperación local: {debugResetUrl}
              </Text>
            ) : null}
          </View>
          <Button size="lg" title="Volver al login" onPress={onBack} />
        </View>
      ) : (
        <>
          <InputField
            autoCapitalize="none"
            autoCorrect={false}
            errorText={errorMessage}
            helperText="Usa el correo que registraste con administracion."
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

          <Button
            disabled={!canSubmit}
            loading={isSubmitting}
            size="lg"
            title="Enviar instrucciones"
            onPress={() => {
              void handleSubmit();
            }}
          />
        </>
      )}
    </AuthShell>
  );
}

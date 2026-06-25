import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import InputField from '../components/molecules/InputField';
import { getMe, updateMe } from '../services/auth';
import { getMyCondominoDetail } from '../services/condomino';
import { getErrorMessage } from '../services/error';
import {
  formatCondominoHouseLabel,
  formatDate,
  mapRoleLabel,
} from '../services/mappers';
import { queryKeys } from '../services/queryKeys';

interface AccountProps {
  onLogout?: () => void;
}

export default function Account({ onLogout }: AccountProps) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
  });
  const condominiumQuery = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
  });
  const updateMeMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: async (user) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.condominiumDetail }),
      ]);
      setFeedbackMessage('Perfil actualizado.');
      setErrorMessage('');
      setFullName(user.name);
      setEmail(user.email);
    },
  });

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    if (!meQuery.data) {
      return;
    }

    setFullName(meQuery.data.name);
    setEmail(meQuery.data.email);
  }, [meQuery.data]);

  const canSubmit =
    fullName.trim().length >= 2 &&
    email.trim().length > 0 &&
    (fullName.trim() !== meQuery.data?.name || email.trim() !== meQuery.data?.email);

  const metaRows = useMemo(
    () =>
      meQuery.data
        ? [
            { label: 'Rol', value: mapRoleLabel(meQuery.data.role) },
            {
              label: 'Condominio activo',
              value:
                meQuery.data.currentCondominium?.name ?? 'Sin condominio asignado',
            },
            {
              label: 'Casa asociada',
              value: formatCondominoHouseLabel(condominiumQuery.data),
            },
            { label: 'Creado', value: formatDate(meQuery.data.createdAt) },
          ]
        : [],
    [condominiumQuery.data, meQuery.data],
  );

  return (
    <Card width="full">
      <View className="gap-6">
        <View className="gap-2">
          <Text className="font-heading text-2xl text-primary">Mi cuenta</Text>
          <Text className="font-body text-base text-med-gray">
            Actualiza la información básica registrada en tu acceso.
          </Text>
        </View>

        {meQuery.isLoading ? (
          <Text className="font-body text-sm text-med-gray">
            Cargando perfil...
          </Text>
        ) : meQuery.error ? (
          <Text className="font-body text-sm text-danger">
            {getErrorMessage(meQuery.error, 'No fue posible cargar el perfil.')}
          </Text>
        ) : (
          <>
            <View className="gap-4">
              <InputField
                autoCapitalize="words"
                errorText={errorMessage}
                label="Nombre completo"
                placeholder="Mario Hernández"
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                  if (feedbackMessage) {
                    setFeedbackMessage('');
                  }
                }}
              />

              <InputField
                autoCapitalize="none"
                keyboardType="email-address"
                label="Correo electrónico"
                placeholder="mario@buenentorno.mx"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                  if (feedbackMessage) {
                    setFeedbackMessage('');
                  }
                }}
              />
            </View>

            <View className="gap-3 rounded-2xl border border-light-gray bg-[#F8F7FA] p-4">
              {metaRows.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-start justify-between gap-4"
                >
                  <Text className="font-heading text-sm text-primary">
                    {row.label}
                  </Text>
                  <Text className="flex-1 text-right font-body text-sm text-primary">
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {feedbackMessage ? (
              <Text className="font-body text-sm text-success">
                {feedbackMessage}
              </Text>
            ) : null}

            <View className="gap-3">
              <Button
                disabled={!canSubmit}
                loading={updateMeMutation.isPending}
                title="Guardar cambios"
                onPress={() => {
                  updateMeMutation.mutate(
                    {
                      name: fullName.trim(),
                      email: email.trim(),
                    },
                    {
                      onError: (error) => {
                        setFeedbackMessage('');
                        setErrorMessage(
                          getErrorMessage(
                            error,
                            'No fue posible actualizar la cuenta.',
                          ),
                        );
                      },
                    },
                  );
                }}
              />

              <Button
                icon="log-out-outline"
                title="Cerrar sesión"
                variant="outline"
                onPress={onLogout}
              />
            </View>
          </>
        )}
      </View>
    </Card>
  );
}

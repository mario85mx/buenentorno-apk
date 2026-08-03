import { useAppThemeColors } from '../theme/tokens';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import InputField from '../components/molecules/InputField';
import SelectField from '../components/molecules/SelectField';
import {
  FIELD_CONTROL_CLASS,
  FIELD_INPUT_CLASS,
  FIELD_PLACEHOLDER_CLASS,
  FieldShell,
  cn,
} from '../components/molecules/fieldShared';
import { getMyCondominoDetail } from '../services/condomino';
import { getErrorMessage } from '../services/error';
import { buildTicketCreatePayload } from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import { createTicket } from '../services/tickets';
import {
  type UploadReceiptFilePayload,
} from '../services/types';
import {
  TicketPriority,
  ticketCategoryOptions,
  ticketPriorityOptions,
} from './ticketsData';

interface NewTicketProps {
  onBack?: () => void;
  onCreated?: (ticketId: string) => void;
}

export default function NewTicket({ onBack, onCreated }: NewTicketProps) {
  const themeColors = useAppThemeColors();
  const queryClient = useQueryClient();
  const condominiumQuery = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
  });
  const createTicketMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async (ticket) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.ticketDetail(String(ticket.id)),
        }),
      ]);
    },
  });

  const [house, setHouse] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<TicketPriority | null>('Media');
  const [initialMessage, setInitialMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [evidence, setEvidence] = useState<UploadReceiptFilePayload | null>(null);
  const [pickingEvidence, setPickingEvidence] = useState(false);

  const pickEvidence = async () => {
    setPickingEvidence(true);
    setErrorMessage('');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      if (asset.size && asset.size > 5 * 1024 * 1024) {
        setErrorMessage('La evidencia supera el peso máximo de 5 MB.');
        return;
      }
      const normalizedName = asset.name.toLowerCase();
      const mimeType = asset.mimeType === 'image/jpeg' || asset.mimeType === 'image/png' || asset.mimeType === 'application/pdf'
        ? asset.mimeType
        : normalizedName.endsWith('.jpg') || normalizedName.endsWith('.jpeg')
          ? 'image/jpeg'
          : normalizedName.endsWith('.png')
            ? 'image/png'
            : normalizedName.endsWith('.pdf')
              ? 'application/pdf'
              : null;
      if (!mimeType) {
        setErrorMessage('La evidencia debe ser un archivo JPG, PNG o PDF.');
        return;
      }
      setEvidence({ uri: asset.uri, name: asset.name, mimeType, size: asset.size });
    } finally {
      setPickingEvidence(false);
    }
  };

  const houseOptions = useMemo(() => {
    const options = [{ label: 'General', value: 'general' }];

    for (const unit of condominiumQuery.data?.units ?? []) {
      options.push({
        label: unit.houseNumber,
        value: String(unit.id),
      });
    }

    return options;
  }, [condominiumQuery.data?.units]);

  const isFormValid =
    !!house &&
    subject.trim().length > 0 &&
    !!category &&
    !!priority &&
    initialMessage.trim().length > 0;

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center self-start rounded-full px-1 py-1"
        onPress={onBack}
      >
        <Ionicons color={themeColors.text} name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">Volver</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">
          Nuevo ticket
        </Text>
        <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
          Registra una nueva solicitud o incidencia para seguimiento.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-4">
          {condominiumQuery.isLoading ? (
            <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
              Cargando unidades...
            </Text>
          ) : condominiumQuery.error ? (
            <Text className="font-body text-sm text-danger">
              {getErrorMessage(
                condominiumQuery.error,
                'No fue posible cargar las unidades disponibles.',
              )}
            </Text>
          ) : (
            <>
              <SelectField
                label="Casa"
                options={houseOptions}
                value={house}
                onChange={(value) => {
                  setHouse(value);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
              />

              <InputField
                errorText={errorMessage}
                label="Asunto"
                placeholder="Describe brevemente el motivo del ticket"
                value={subject}
                onChangeText={(value) => {
                  setSubject(value);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
              />

              <SelectField
                label="Categoría"
                options={ticketCategoryOptions}
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
              />

              <SelectField
                label="Prioridad"
                options={ticketPriorityOptions}
                value={priority}
                onChange={(value) => {
                  setPriority(value as TicketPriority);
                  if (errorMessage) {
                    setErrorMessage('');
                  }
                }}
              />

              <FieldShell label="Mensaje inicial">
                <TextInput
                  multiline
                  numberOfLines={5}
                  placeholder="Escribe el detalle inicial del ticket"
                  placeholderTextColor={themeColors.textMuted}
                  selectionColor={themeColors.text}
                  textAlignVertical="top"
                  value={initialMessage}
                  onChangeText={(value) => {
                    setInitialMessage(value);
                    if (errorMessage) {
                      setErrorMessage('');
                    }
                  }}
                  className={cn(
                    FIELD_INPUT_CLASS,
                    FIELD_PLACEHOLDER_CLASS,
                    'min-h-28 py-3',
                  )}
                />
              </FieldShell>

              <FieldShell label="Evidencia" helperText="Archivo opcional JPG, PNG o PDF. Máximo 5 MB.">
                <Pressable
                  accessibilityRole="button"
                  className={cn(FIELD_CONTROL_CLASS, 'flex-row items-center justify-between gap-3')}
                  disabled={pickingEvidence}
                  onPress={() => void pickEvidence()}
                >
                  <Text className="flex-1 font-body text-base text-primary dark:text-[#F7F2FB]" numberOfLines={1}>
                    {evidence?.name ?? 'Seleccionar archivo'}
                  </Text>
                  <Ionicons color={themeColors.textMuted} name={evidence ? 'checkmark-circle-outline' : 'cloud-upload-outline'} size={20} />
                </Pressable>
              </FieldShell>
              {evidence ? (
                <Pressable accessibilityRole="button" className="self-start px-2 py-1" onPress={() => setEvidence(null)}>
                  <Text className="font-body-semibold text-sm text-danger">Quitar evidencia</Text>
                </Pressable>
              ) : null}

              <View className="gap-3 pt-2">
                <Button
                  title="Crear ticket"
                  disabled={!isFormValid}
                  loading={createTicketMutation.isPending}
                  onPress={() => {
                    if (
                      !house ||
                      !category ||
                      !priority ||
                      !condominiumQuery.data
                    ) {
                      return;
                    }

                    createTicketMutation.mutate(
                      buildTicketCreatePayload({
                        subject: subject.trim(),
                        category,
                        priority,
                        message: initialMessage.trim(),
                        condominoId: condominiumQuery.data.id,
                        unitId: house === 'general' ? undefined : Number(house),
                        evidence: evidence ?? undefined,
                      }),
                      {
                        onSuccess: (ticket) => {
                          onCreated?.(String(ticket.id));
                        },
                        onError: (error) => {
                          setErrorMessage(
                            getErrorMessage(
                              error,
                              'No fue posible crear el ticket.',
                            ),
                          );
                        },
                      },
                    );
                  }}
                />
                <Button title="Cancelar" variant="secondary" onPress={onBack} />
              </View>
            </>
          )}
        </View>
      </Card>
    </View>
  );
}

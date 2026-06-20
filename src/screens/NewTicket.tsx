import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import InputField from '../components/molecules/InputField';
import SelectField from '../components/molecules/SelectField';
import {
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
  TicketPriority,
  ticketCategoryOptions,
  ticketPriorityOptions,
} from './ticketsData';

interface NewTicketProps {
  onBack?: () => void;
  onCreated?: (ticketId: string) => void;
}

export default function NewTicket({ onBack, onCreated }: NewTicketProps) {
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
        <Ionicons color="#18052E" name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary">Volver</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary">
          Nuevo ticket
        </Text>
        <Text className="font-body text-base text-med-gray">
          Registra una nueva solicitud o incidencia para seguimiento.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-4">
          {condominiumQuery.isLoading ? (
            <Text className="font-body text-sm text-med-gray">
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
                  placeholderTextColor="#374151"
                  selectionColor="#18052E"
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

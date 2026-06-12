import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import {
  FIELD_INPUT_CLASS,
  FIELD_PLACEHOLDER_CLASS,
  FieldShell,
  cn,
} from '../components/molecules/fieldShared';
import {
  Ticket,
  TicketStatus,
  getTicketPriorityVariant,
  getTicketStatusVariant,
} from './ticketsData';

interface TicketDetailProps {
  ticket?: Ticket | null;
  onBack?: () => void;
  onAddMessage?: (ticketId: string, message: string) => void;
  onUpdateStatus?: (ticketId: string, status: TicketStatus) => void;
}

export default function TicketDetail({
  ticket,
  onBack,
  onAddMessage,
  onUpdateStatus,
}: TicketDetailProps) {
  const [draftMessage, setDraftMessage] = useState('');

  const detailRows = useMemo(
    () =>
      ticket
        ? [
            { label: 'Asunto', value: ticket.subject },
            { label: 'Casa', value: ticket.house },
            { label: 'Prioridad', value: ticket.priority },
            { label: 'Estatus', value: ticket.status },
            { label: 'Asignado', value: ticket.assignedTo },
            { label: 'Última actividad', value: ticket.lastActivity },
          ]
        : [],
    [ticket],
  );

  if (!ticket) {
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

        <Card width="full">
          <Text className="font-body text-base text-med-gray">
            No se encontró el ticket solicitado.
          </Text>
        </Card>
      </View>
    );
  }

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
          Detalle del ticket
        </Text>
        <Text className="font-body text-base text-med-gray">
          Consulta el seguimiento, mensajes y acciones disponibles.
        </Text>
      </View>

      <Card width="full">
        <View className="gap-5">
          <View className="gap-3">
            <View className="flex-row flex-wrap items-center gap-2">
              <Badge
                label={ticket.priority}
                variant={getTicketPriorityVariant(ticket.priority)}
              />
              <Badge
                label={ticket.status}
                variant={getTicketStatusVariant(ticket.status)}
              />
            </View>

            <View className="gap-3">
              {detailRows.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-start justify-between gap-4 border-b border-light-gray pb-3"
                >
                  <Text className="font-heading text-sm text-primary">
                    {row.label}
                  </Text>
                  <Text className="flex-1 text-right font-body-semibold text-sm text-primary">
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-heading text-lg text-primary">Mensajes</Text>

            <View className="gap-3">
              {ticket.messages.map((message) => (
                <View
                  key={message.id}
                  className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3',
                    message.isResident
                      ? 'self-end bg-primary'
                      : 'self-start bg-[#F3EEF8]',
                  )}
                >
                  <Text
                    className={cn(
                      'font-body-semibold text-xs',
                      message.isResident ? 'text-white/80' : 'text-primary',
                    )}
                  >
                    {message.author}
                  </Text>
                  <Text
                    className={cn(
                      'mt-1 font-body text-sm leading-6',
                      message.isResident ? 'text-white' : 'text-primary',
                    )}
                  >
                    {message.body}
                  </Text>
                  <Text
                    className={cn(
                      'mt-2 font-body text-xs',
                      message.isResident ? 'text-white/70' : 'text-med-gray',
                    )}
                  >
                    {message.timestamp}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3">
            <Text className="font-heading text-lg text-primary">Acciones</Text>

            <FieldShell label="Nuevo mensaje">
              <TextInput
                multiline
                numberOfLines={4}
                placeholder="Escribe un mensaje para dar seguimiento al ticket"
                placeholderTextColor="#374151"
                selectionColor="#18052E"
                textAlignVertical="top"
                value={draftMessage}
                onChangeText={setDraftMessage}
                className={cn(
                  FIELD_INPUT_CLASS,
                  FIELD_PLACEHOLDER_CLASS,
                  'min-h-24 py-3',
                )}
              />
            </FieldShell>

            <Button
              icon="send-outline"
              title="Enviar mensaje"
              disabled={!draftMessage.trim()}
              onPress={() => {
                const nextMessage = draftMessage.trim();

                if (!nextMessage) {
                  return;
                }

                onAddMessage?.(ticket.id, nextMessage);
                setDraftMessage('');
              }}
            />

            {ticket.status !== 'En proceso' && ticket.status !== 'Cerrado' ? (
              <Button
                title="Marcar en proceso"
                variant="secondary"
                onPress={() => onUpdateStatus?.(ticket.id, 'En proceso')}
              />
            ) : null}

            {ticket.status !== 'En espera' && ticket.status !== 'Cerrado' ? (
              <Button
                title="Poner en espera"
                variant="secondary"
                onPress={() => onUpdateStatus?.(ticket.id, 'En espera')}
              />
            ) : null}

            {ticket.status !== 'Cerrado' ? (
              <Button
                title="Cerrar ticket"
                variant="danger"
                onPress={() => onUpdateStatus?.(ticket.id, 'Cerrado')}
              />
            ) : (
              <Button
                title="Reabrir ticket"
                variant="secondary"
                onPress={() => onUpdateStatus?.(ticket.id, 'Abierto')}
              />
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}

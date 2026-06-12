import { useState } from 'react';
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
import {
  NewTicketPayload,
  TicketPriority,
  ticketCategoryOptions,
  ticketHouseOptions,
  ticketPriorityOptions,
} from './ticketsData';

interface NewTicketProps {
  onBack?: () => void;
  onSubmit?: (payload: NewTicketPayload) => void;
}

export default function NewTicket({ onBack, onSubmit }: NewTicketProps) {
  const [house, setHouse] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [priority, setPriority] = useState<TicketPriority | null>(null);
  const [initialMessage, setInitialMessage] = useState('');

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
          <SelectField
            label="Casa"
            options={ticketHouseOptions}
            value={house}
            onChange={setHouse}
          />

          <InputField
            label="Asunto"
            placeholder="Describe brevemente el motivo del ticket"
            value={subject}
            onChangeText={setSubject}
          />

          <SelectField
            label="Categoría"
            options={ticketCategoryOptions}
            value={category}
            onChange={setCategory}
          />

          <SelectField
            label="Prioridad"
            options={ticketPriorityOptions}
            value={priority}
            onChange={(value) => setPriority(value as TicketPriority)}
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
              onChangeText={setInitialMessage}
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
              onPress={() => {
                if (!house || !category || !priority) {
                  return;
                }

                onSubmit?.({
                  house,
                  subject: subject.trim(),
                  category,
                  priority,
                  initialMessage: initialMessage.trim(),
                });
              }}
            />
            <Button title="Cancelar" variant="secondary" onPress={onBack} />
          </View>
        </View>
      </Card>
    </View>
  );
}

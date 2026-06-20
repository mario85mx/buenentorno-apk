import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import SelectField from '../components/molecules/SelectField';
import { getErrorMessage } from '../services/error';
import { mapTicketSummaryToViewModel } from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import { listTickets } from '../services/tickets';
import {
  type Ticket,
  getTicketPriorityVariant,
  getTicketStatusVariant,
  ticketPriorityOptions,
  ticketStatusOptions,
} from './ticketsData';

interface TicketsProps {
  onOpenTicketDetail?: (ticket: Ticket) => void;
  onOpenNewTicket?: () => void;
}

const statusFilterOptions = [
  { label: 'Todos', value: 'Todos' },
  ...ticketStatusOptions,
];

const priorityFilterOptions = [
  { label: 'Todas', value: 'Todas' },
  ...ticketPriorityOptions,
];

export default function Tickets({
  onOpenTicketDetail,
  onOpenNewTicket,
}: TicketsProps) {
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedPriority, setSelectedPriority] = useState('Todas');

  const ticketsQuery = useQuery({
    queryKey: queryKeys.tickets,
    queryFn: () => listTickets(),
    select: (tickets) => tickets.map(mapTicketSummaryToViewModel),
  });

  const tickets = ticketsQuery.data ?? [];
  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const matchesStatus =
          selectedStatus === 'Todos' || ticket.status === selectedStatus;
        const matchesPriority =
          selectedPriority === 'Todas' || ticket.priority === selectedPriority;

        return matchesStatus && matchesPriority;
      }),
    [selectedPriority, selectedStatus, tickets],
  );

  const summaryCards = useMemo(
    () => [
      {
        label: 'Abiertos',
        value: tickets.filter((ticket) => ticket.status === 'Abierto').length,
        valueClassName: 'text-warning',
      },
      {
        label: 'En Proceso',
        value: tickets.filter((ticket) => ticket.status === 'En proceso').length,
        valueClassName: 'text-primary',
      },
      {
        label: 'En Espera',
        value: tickets.filter(
          (ticket) => ticket.status === 'En espera del condómino',
        ).length,
        valueClassName: 'text-[#2F7CF6]',
      },
      {
        label: 'Cerrados',
        value: tickets.filter((ticket) =>
          ticket.status === 'Resuelto' || ticket.status === 'Cerrado',
        ).length,
        valueClassName: 'text-success',
      },
    ],
    [tickets],
  );

  return (
    <View className="gap-5">
      <View className="gap-4">
        <View className="gap-2">
          <Text className="font-heading text-2xl text-primary">Tickets</Text>
          <Text className="font-body text-base text-med-gray">
            Abre solicitudes a administración y da seguimiento a cada respuesta.
          </Text>
        </View>

        <Button
          icon="add-circle-outline"
          title="Nuevo ticket"
          onPress={onOpenNewTicket}
        />
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-4">
        {summaryCards.map((card) => (
          <Card key={card.label} width="half">
            <Text className="font-body text-sm text-primary">{card.label}</Text>
            <Text className={`mt-2 font-heading text-2xl ${card.valueClassName}`}>
              {card.value}
            </Text>
          </Card>
        ))}
      </View>

      <Card width="full">
        <View className="gap-4">
          <Text className="font-heading text-lg text-primary">Filtros</Text>
          <SelectField
            label="Estatus"
            options={statusFilterOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
          <SelectField
            label="Prioridad"
            options={priorityFilterOptions}
            value={selectedPriority}
            onChange={setSelectedPriority}
          />
        </View>
      </Card>

      <View className="gap-3">
        {ticketsQuery.isLoading ? (
          <Card className="rounded-lg border border-light-gray px-4 py-4">
            <Text className="font-body text-sm text-med-gray">
              Cargando tickets...
            </Text>
          </Card>
        ) : ticketsQuery.error ? (
          <Card className="rounded-lg border border-light-gray px-4 py-4">
            <Text className="font-body text-sm text-danger">
              {getErrorMessage(
                ticketsQuery.error,
                'No fue posible cargar los tickets.',
              )}
            </Text>
          </Card>
        ) : filteredTickets.length ? (
          filteredTickets.map((ticket) => (
            <Pressable
              key={ticket.id}
              accessibilityHint="Abre el detalle del ticket"
              accessibilityRole="button"
              className="rounded-lg"
              onPress={() => onOpenTicketDetail?.(ticket)}
            >
              <Card className="rounded-lg border border-light-gray px-4 py-4">
                <View className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Text className="font-heading text-lg text-primary">
                        {ticket.subject}
                      </Text>
                      <Text className="font-body text-sm text-med-gray">
                        {ticket.category}
                      </Text>
                    </View>

                    <Ionicons
                      color="#9CA3AF"
                      name="chevron-forward"
                      size={18}
                    />
                  </View>

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

                  <View className="gap-1">
                    <Text className="font-body text-sm text-primary">
                      Casa: {ticket.house}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Mensajes: {ticket.messagesCount}
                    </Text>
                    <Text className="font-body text-sm text-med-gray">
                      Última actividad: {ticket.lastActivity}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        ) : (
          <Card className="rounded-lg border border-light-gray px-4 py-4">
            <Text className="font-body text-sm text-med-gray">
              No hay tickets que coincidan con los filtros seleccionados.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}

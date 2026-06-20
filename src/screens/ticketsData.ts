export type TicketStatus =
  | 'Abierto'
  | 'En proceso'
  | 'En espera del condómino'
  | 'Resuelto'
  | 'Cerrado';
export type TicketPriority = 'Urgente' | 'Alta' | 'Media' | 'Baja';
export type TicketBadgeVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'accent';

export interface TicketMessage {
  id: string;
  author: string;
  body: string;
  timestamp: string;
  isResident: boolean;
}

export interface Ticket {
  id: string;
  subject: string;
  house: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  residentName: string;
  assignedTo: string;
  createdAt: string;
  lastActivity: string;
  messagesCount: number;
  messages: TicketMessage[];
}

export interface NewTicketPayload {
  house: string;
  subject: string;
  category: string;
  priority: TicketPriority;
  initialMessage: string;
}

export const ticketStatusOptions = [
  { label: 'Abierto', value: 'Abierto' },
  { label: 'En proceso', value: 'En proceso' },
  {
    label: 'En espera del condómino',
    value: 'En espera del condómino',
  },
  { label: 'Resuelto', value: 'Resuelto' },
  { label: 'Cerrado', value: 'Cerrado' },
];

export const ticketPriorityOptions = [
  { label: 'Urgente', value: 'Urgente' },
  { label: 'Alta', value: 'Alta' },
  { label: 'Media', value: 'Media' },
  { label: 'Baja', value: 'Baja' },
];

export const ticketHouseOptions = [
  { label: 'General', value: 'General' },
  { label: 'Casa 12', value: 'Casa 12' },
  { label: 'Casa 18', value: 'Casa 18' },
  { label: 'Casa 24', value: 'Casa 24' },
];

export const ticketCategoryOptions = [
  { label: 'Administración', value: 'Administración' },
  { label: 'Mantenimiento', value: 'Mantenimiento' },
  { label: 'Seguridad', value: 'Seguridad' },
  { label: 'Limpieza', value: 'Limpieza' },
];

export const initialTickets: Ticket[] = [
  {
    id: 'ticket-1',
    subject: 'Fuga de agua en pasillo central',
    house: 'Casa 12',
    category: 'Mantenimiento',
    priority: 'Alta',
    status: 'Abierto',
    residentName: 'Residente',
    assignedTo: 'Sin asignar',
    createdAt: '11/06/2026 09:20',
    lastActivity: '11/06/2026 09:20',
    messagesCount: 1,
    messages: [
      {
        id: 'ticket-1-message-1',
        author: 'Residente',
        body: 'Se detectó una fuga de agua frente al pasillo central desde esta mañana.',
        timestamp: '11/06/2026 09:20',
        isResident: true,
      },
    ],
  },
  {
    id: 'ticket-2',
    subject: 'Lámpara apagada en estacionamiento',
    house: 'General',
    category: 'Mantenimiento',
    priority: 'Media',
    status: 'En proceso',
    residentName: 'Residente',
    assignedTo: 'Carlos Mendoza',
    createdAt: '10/06/2026 18:32',
    lastActivity: '11/06/2026 08:45',
    messagesCount: 2,
    messages: [
      {
        id: 'ticket-2-message-1',
        author: 'Residente',
        body: 'La lámpara del cajón de visitas no enciende por las noches.',
        timestamp: '10/06/2026 18:32',
        isResident: true,
      },
      {
        id: 'ticket-2-message-2',
        author: 'Administración',
        body: 'El área de mantenimiento ya fue notificada y revisará el punto hoy.',
        timestamp: '11/06/2026 08:45',
        isResident: false,
      },
    ],
  },
];

export function getTicketPriorityVariant(
  priority: TicketPriority,
): TicketBadgeVariant {
  if (priority === 'Urgente') {
    return 'danger';
  }

  if (priority === 'Alta' || priority === 'Media') {
    return 'warning';
  }

  return 'neutral';
}

export function getTicketStatusVariant(
  status: TicketStatus,
): TicketBadgeVariant {
  if (status === 'Resuelto' || status === 'Cerrado') {
    return 'success';
  }

  if (status === 'En espera del condómino') {
    return 'info';
  }

  if (status === 'En proceso') {
    return 'accent';
  }

  return 'warning';
}

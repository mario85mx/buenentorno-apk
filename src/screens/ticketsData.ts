export type TicketStatus = 'Abierto' | 'En proceso' | 'En espera' | 'Cerrado';
export type TicketPriority = 'Alta' | 'Media' | 'Baja';
export type TicketBadgeVariant = 'success' | 'danger' | 'warning';

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
  assignedTo: string;
  lastActivity: string;
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
  { label: 'En espera', value: 'En espera' },
  { label: 'Cerrado', value: 'Cerrado' },
];

export const ticketPriorityOptions = [
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
    assignedTo: 'Sin asignar',
    lastActivity: '11/06/2026 09:20',
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
    assignedTo: 'Carlos Mendoza',
    lastActivity: '11/06/2026 08:45',
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
  {
    id: 'ticket-3',
    subject: 'Solicitud de acceso para proveedor',
    house: 'Casa 18',
    category: 'Seguridad',
    priority: 'Baja',
    status: 'En espera',
    assignedTo: 'Recepción',
    lastActivity: '10/06/2026 16:10',
    messages: [
      {
        id: 'ticket-3-message-1',
        author: 'Residente',
        body: 'Solicito registrar acceso para proveedor mañana a las 10:00 a.m.',
        timestamp: '10/06/2026 15:40',
        isResident: true,
      },
      {
        id: 'ticket-3-message-2',
        author: 'Administración',
        body: 'Quedamos en espera del nombre completo y placa del vehículo.',
        timestamp: '10/06/2026 16:10',
        isResident: false,
      },
    ],
  },
  {
    id: 'ticket-4',
    subject: 'Aclaración de cargo extraordinario',
    house: 'Casa 24',
    category: 'Administración',
    priority: 'Media',
    status: 'Cerrado',
    assignedTo: 'Ana López',
    lastActivity: '09/06/2026 12:30',
    messages: [
      {
        id: 'ticket-4-message-1',
        author: 'Residente',
        body: 'Necesito aclarar el cargo extraordinario reflejado en mi estado de cuenta.',
        timestamp: '09/06/2026 10:05',
        isResident: true,
      },
      {
        id: 'ticket-4-message-2',
        author: 'Administración',
        body: 'Se revisó el cargo y ya se compartió el detalle correspondiente.',
        timestamp: '09/06/2026 12:30',
        isResident: false,
      },
    ],
  },
];

export function getTicketPriorityVariant(
  priority: TicketPriority,
): TicketBadgeVariant {
  if (priority === 'Alta') {
    return 'danger';
  }

  if (priority === 'Media') {
    return 'warning';
  }

  return 'success';
}

export function getTicketStatusVariant(
  status: TicketStatus,
): TicketBadgeVariant {
  if (status === 'Abierto') {
    return 'danger';
  }

  if (status === 'Cerrado') {
    return 'success';
  }

  return 'warning';
}

export const queryKeys = {
  me: ['auth', 'me'] as const,
  condominiumDetail: ['condominos', 'me'] as const,
  dashboardSummary: ['dashboard', 'summary'] as const,
  notices: ['notices'] as const,
  notifications: ['notifications'] as const,
  tickets: ['tickets'] as const,
  ticketDetail: (ticketId: string | number) => ['tickets', ticketId] as const,
};


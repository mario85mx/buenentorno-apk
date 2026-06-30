export const queryKeys = {
  me: ['auth', 'me'] as const,
  condominiumDetail: ['condominos', 'me'] as const,
  dashboardSummary: ['dashboard', 'summary'] as const,
  notices: ['notices'] as const,
  surveys: ['surveys'] as const,
  surveyDetail: (surveyId: string | number) => ['surveys', surveyId] as const,
  notifications: ['notifications'] as const,
  commonAreas: ['common-areas'] as const,
  commonAreaReservations: (commonAreaId?: number | null) =>
    ['common-area-reservations', commonAreaId ?? 'all'] as const,
  tickets: ['tickets'] as const,
  ticketDetail: (ticketId: string | number) => ['tickets', ticketId] as const,
  visitorAccessMine: ['visitor-access', 'mine'] as const,
  visitorAccessToday: ['visitor-access', 'operator', 'today'] as const,
};

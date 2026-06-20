import { api } from './api';
import type {
  CreateTicketMessagePayload,
  CreateTicketPayload,
  TicketDetailDto,
  TicketListResponse,
  TicketPriorityCode,
  TicketStatusCode,
  UpdateTicketPayload,
} from './types';

export interface ListTicketsParams {
  status?: TicketStatusCode;
  priority?: TicketPriorityCode;
  search?: string;
  condominoId?: number;
  unitId?: number;
}

export async function listTickets(params: ListTicketsParams = {}) {
  const { data } = await api.get<TicketListResponse>('/tickets', { params });
  return data.data;
}

export async function getTicket(ticketId: number) {
  const { data } = await api.get<TicketDetailDto>(`/tickets/${ticketId}`);
  return data;
}

export async function createTicket(payload: CreateTicketPayload) {
  const { data } = await api.post<TicketDetailDto>('/tickets', payload);
  return data;
}

export async function addTicketMessage(
  ticketId: number,
  payload: CreateTicketMessagePayload,
) {
  const { data } = await api.post<TicketDetailDto>(
    `/tickets/${ticketId}/messages`,
    payload,
  );
  return data;
}

export async function updateTicket(
  ticketId: number,
  payload: UpdateTicketPayload,
) {
  const { data } = await api.patch<TicketDetailDto>(
    `/tickets/${ticketId}`,
    payload,
  );
  return data;
}


import { api } from './api';
import type {
  CommonAreaDto,
  CommonAreaListResponse,
  CommonAreaReservationDto,
  CommonAreaReservationListResponse,
  CommonAreaReservationStatus,
  CreateCommonAreaReservationPayload,
} from './types';

const COMMON_AREA_TIME_STEP_MINUTES = 15;

export interface ListCommonAreaReservationsParams {
  commonAreaId?: number;
  status?: CommonAreaReservationStatus;
  date?: string;
}

export async function getCommonAreas() {
  const { data } = await api.get<CommonAreaListResponse>('/common-areas');
  return data.data;
}

export async function getCommonAreaReservations(
  params: ListCommonAreaReservationsParams = {},
) {
  const { data } = await api.get<CommonAreaReservationListResponse>(
    '/common-area-reservations',
    { params },
  );
  return data.data;
}

export async function createCommonAreaReservation(
  payload: CreateCommonAreaReservationPayload,
) {
  const { data } = await api.post<CommonAreaReservationDto>(
    '/common-area-reservations',
    payload,
  );
  return data;
}

export async function cancelCommonAreaReservation(
  reservationId: number,
  cancelReason?: string,
) {
  const { data } = await api.patch<CommonAreaReservationDto>(
    `/common-area-reservations/${reservationId}/cancel`,
    cancelReason?.trim() ? { cancelReason: cancelReason.trim() } : {},
  );
  return data;
}

export function buildCommonAreaDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildCommonAreaDateTimeIso(date: Date, time: string) {
  const [hoursText = '0', minutesText = '0'] = time.split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0,
  ).toISOString();
}

export function createTimeOptions() {
  const formatTime = (minutes: number) => {
    const normalizedHours = Math.floor(minutes / 60) % 24;
    const normalizedMinutes = minutes % 60;
    return `${String(normalizedHours).padStart(2, '0')}:${String(
      normalizedMinutes,
    ).padStart(2, '0')}`;
  };

  const options: Array<{ label: string; value: string }> = [];

  for (
    let currentMinutes = 0;
    currentMinutes < 24 * 60;
    currentMinutes += COMMON_AREA_TIME_STEP_MINUTES
  ) {
    const value = formatTime(currentMinutes);
    options.push({ label: value, value });
  }

  return options;
}

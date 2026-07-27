import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import DatePickerField from '../components/molecules/DatePickerField';
import InputField from '../components/molecules/InputField';
import SelectField from '../components/molecules/SelectField';
import { BottomSheet } from '../components/molecules/fieldShared';
import {
  buildCommonAreaDateParam,
  cancelCommonAreaReservation,
  createCommonAreaReservation,
  getCommonAreaAvailability,
  getCommonAreaReservations,
  getCommonAreas,
} from '../services/commonAreas';
import { getMyCondominoDetail } from '../services/condomino';
import { getErrorMessage, getHttpStatus } from '../services/error';
import { queryKeys } from '../services/queryKeys';
import type {
  CommonAreaDto,
  CommonAreaAvailabilitySlotDto,
  CommonAreaAvailabilityStatus,
  CommonAreaReservationDto,
  CommonAreaReservationStatus,
} from '../services/types';

const reservationStatusOptions = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aprobadas', value: 'APPROVED' },
  { label: 'Rechazadas', value: 'REJECTED' },
  { label: 'Canceladas', value: 'CANCELLED' },
] as const;

type ReservationStatusFilter = (typeof reservationStatusOptions)[number]['value'];

function formatDate(dateString: string, timeZone?: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  }).format(date);
}

function formatTimeRange(startAt: string, endAt: string, timeZone: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startAt} - ${endAt}`;
  }

  const formatter = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatStatus(status: CommonAreaReservationStatus) {
  if (status === 'APPROVED') return 'Aprobada';
  if (status === 'REJECTED') return 'Rechazada';
  if (status === 'CANCELLED') return 'Cancelada';
  return 'Pendiente';
}

function statusTone(status: CommonAreaReservationStatus) {
  if (status === 'APPROVED') {
    return 'bg-[#E8F7EE] dark:bg-[#20352A] text-success';
  }

  if (status === 'REJECTED') {
    return 'bg-[#FDECEC] dark:bg-[#3B2026] text-danger';
  }

  if (status === 'CANCELLED') {
    return 'bg-[#EEF0F3] dark:bg-[#2A2730] text-med-gray dark:text-[#B9B2C2]';
  }

  return 'bg-[#FFF7E6] dark:bg-[#3A3020] text-warning';
}

function formatAvailabilityStatus(status: CommonAreaAvailabilityStatus) {
  if (status === 'APPROVED') return 'Aprobado';
  if (status === 'PENDING') return 'Pendiente';
  if (status === 'REJECTED') return 'Rechazado';
  if (status === 'OCCUPIED') return 'Ocupado';
  return 'Disponible';
}

function availabilityTone(status: CommonAreaAvailabilityStatus) {
  if (status === 'AVAILABLE') return 'bg-[#E8F7EE] dark:bg-[#20352A] text-success';
  if (status === 'PENDING') return 'bg-[#FFF7E6] dark:bg-[#3A3020] text-warning';
  if (status === 'REJECTED') return 'bg-[#FDECEC] dark:bg-[#3B2026] text-danger';
  if (status === 'APPROVED') return 'bg-[#EAF2FF] dark:bg-[#243047] text-primary dark:text-[#F7F2FB]';
  return 'bg-[#EEF0F3] dark:bg-[#2A2730] text-med-gray dark:text-[#B9B2C2]';
}

function isSameDay(dateString: string, selectedDate: Date, timeZone: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';

  return (
    `${part('year')}-${part('month')}-${part('day')}` ===
    buildCommonAreaDateParam(selectedDate)
  );
}

export default function CommonAreas() {
  const queryClient = useQueryClient();
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservationStatusFilter, setReservationStatusFilter] =
    useState<ReservationStatusFilter>('ALL');
  const [reservationDateFilter, setReservationDateFilter] = useState<Date | null>(null);
  const [isReservationSheetOpen, setIsReservationSheetOpen] = useState(false);
  const [isCancelSheetOpen, setIsCancelSheetOpen] = useState(false);
  const [reservationError, setReservationError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [selectedReservation, setSelectedReservation] =
    useState<CommonAreaReservationDto | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [reservationStartTime, setReservationStartTime] = useState<string | null>(null);
  const [reservationEndTime, setReservationEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const commonAreasQuery = useQuery({
    queryKey: queryKeys.commonAreas,
    queryFn: getCommonAreas,
  });
  const condominiumQuery = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
  });
  const reservationsQuery = useQuery({
    queryKey: queryKeys.commonAreaReservations(
      selectedAreaId ? Number(selectedAreaId) : null,
    ),
    queryFn: () =>
      getCommonAreaReservations(
        selectedAreaId ? { commonAreaId: Number(selectedAreaId) } : {},
      ),
    enabled: !!selectedAreaId,
  });
  const selectedDateParam = buildCommonAreaDateParam(selectedDate);
  const availabilityQuery = useQuery({
    queryKey: queryKeys.commonAreaAvailability(
      selectedAreaId ? Number(selectedAreaId) : null,
      selectedDateParam,
    ),
    queryFn: () =>
      getCommonAreaAvailability(Number(selectedAreaId), selectedDateParam),
    enabled: !!selectedAreaId,
  });

  const createReservationMutation = useMutation({
    mutationFn: createCommonAreaReservation,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.commonAreaReservations(
            selectedAreaId ? Number(selectedAreaId) : null,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.commonAreaAvailability(
            selectedAreaId ? Number(selectedAreaId) : null,
            selectedDateParam,
          ),
        }),
      ]);
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: ({
      reservationId,
      reason,
    }: {
      reservationId: number;
      reason?: string;
    }) => cancelCommonAreaReservation(reservationId, reason),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.commonAreaReservations(
            selectedAreaId ? Number(selectedAreaId) : null,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.commonAreaAvailability(
            selectedAreaId ? Number(selectedAreaId) : null,
            selectedDateParam,
          ),
        }),
      ]);
    },
  });

  useEffect(() => {
    if (!selectedAreaId && commonAreasQuery.data?.length) {
      setSelectedAreaId(String(commonAreasQuery.data[0].id));
    }
  }, [commonAreasQuery.data, selectedAreaId]);

  useEffect(() => {
    if (!selectedUnitId && condominiumQuery.data?.units.length) {
      setSelectedUnitId(String(condominiumQuery.data.units[0].id));
    }
  }, [condominiumQuery.data?.units, selectedUnitId]);

  const selectedArea = useMemo<CommonAreaDto | null>(
    () =>
      commonAreasQuery.data?.find(
        (area) => String(area.id) === String(selectedAreaId),
      ) ?? null,
    [commonAreasQuery.data, selectedAreaId],
  );

  const areaOptions = useMemo(
    () =>
      (commonAreasQuery.data ?? []).map((area) => ({
        label: area.name,
        value: String(area.id),
      })),
    [commonAreasQuery.data],
  );

  const unitOptions = useMemo(
    () =>
      (condominiumQuery.data?.units ?? []).map((unit) => ({
        label: `Casa ${unit.houseNumber}`,
        value: String(unit.id),
      })),
    [condominiumQuery.data?.units],
  );

  const reservations = reservationsQuery.data ?? [];
  const hasLinkedCondomino = getHttpStatus(condominiumQuery.error) !== 404;
  const upcomingAvailabilitySlots = useMemo(
    () =>
      (availabilityQuery.data?.slots ?? []).filter((slot) => {
        const startAt = new Date(slot.startAt).getTime();
        return Number.isFinite(startAt) && startAt > currentTime;
      }),
    [availabilityQuery.data?.slots, currentTime],
  );

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredReservations = useMemo(
    () =>
      reservations
        .filter((reservation) =>
          reservationStatusFilter === 'ALL'
            ? true
            : reservation.status === reservationStatusFilter,
        )
        .filter((reservation) =>
          reservationDateFilter
            ? isSameDay(
                reservation.startAt,
                reservationDateFilter,
                reservation.area.timeZone,
              )
            : true,
        )
        .sort(
          (left, right) =>
            new Date(right.startAt).getTime() - new Date(left.startAt).getTime(),
        ),
    [reservationDateFilter, reservationStatusFilter, reservations],
  );

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.commonAreas }),
      queryClient.invalidateQueries({ queryKey: queryKeys.condominiumDetail }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.commonAreaAvailability(
          selectedAreaId ? Number(selectedAreaId) : null,
          selectedDateParam,
        ),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.commonAreaReservations(
          selectedAreaId ? Number(selectedAreaId) : null,
        ),
      }),
    ]);
  };

  const openReservationSheet = (slot: CommonAreaAvailabilitySlotDto) => {
    if (!slot.canReserve) return;

    setReservationStartTime(slot.startAt);
    setReservationEndTime(slot.endAt);
    setNotes('');
    setReservationError('');
    setIsReservationSheetOpen(true);
  };

  const handleCreateReservation = () => {
    if (!selectedArea || !selectedUnitId || !reservationStartTime || !reservationEndTime) {
      setReservationError('Selecciona una unidad para completar la reservación.');
      return;
    }

    createReservationMutation.mutate(
      {
        commonAreaId: selectedArea.id,
        unitId: Number(selectedUnitId),
        startAt: reservationStartTime,
        endAt: reservationEndTime,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsReservationSheetOpen(false);
          setReservationError('');
        },
        onError: (error) => {
          setReservationError(
            getErrorMessage(error, 'No fue posible crear la reservación.'),
          );
        },
      },
    );
  };

  const handleCancelReservation = () => {
    if (!selectedReservation) {
      return;
    }

    cancelReservationMutation.mutate(
      {
        reservationId: selectedReservation.id,
        reason: cancelReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsCancelSheetOpen(false);
          setSelectedReservation(null);
          setCancelReason('');
          setCancelError('');
        },
        onError: (error) => {
          setCancelError(
            getErrorMessage(error, 'No fue posible cancelar la reservación.'),
          );
        },
      },
    );
  };

  return (
    <>
      <View className="gap-5">
        <View className="gap-4">
          <View className="gap-2">
            <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">
              Áreas comunes
            </Text>
            <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
              Toca un horario disponible para iniciar una reservación.
            </Text>
          </View>

          {!hasLinkedCondomino ? (
            <View className="rounded-2xl border border-[#F6C77A] bg-[#FFF7E6] dark:bg-[#3A3020] px-4 py-4">
              <Text className="font-body text-sm text-primary dark:text-[#F7F2FB]">
                Tu cuenta no tiene un condomino vinculado. Puedes consultar disponibilidad,
                pero no crear reservaciones hasta que se vincule tu perfil.
              </Text>
            </View>
          ) : null}

          <View className="flex-row justify-end gap-3">
            <Button
              icon="refresh-outline"
              title="Actualizar"
              variant="secondary"
              onPress={() => {
                void handleRefresh();
              }}
            />
          </View>
        </View>

        <View className="gap-5 lg:flex-row">
          <View className="gap-5 lg:w-[42%]">
            <Card width="full">
              <View className="gap-4">
                <SelectField
                  label="Área común"
                  options={areaOptions}
                  value={selectedAreaId}
                  onChange={setSelectedAreaId}
                />

                {commonAreasQuery.isLoading ? (
                  <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                    Cargando áreas comunes...
                  </Text>
                ) : commonAreasQuery.error ? (
                  <Text className="font-body text-sm text-danger">
                    {getErrorMessage(
                      commonAreasQuery.error,
                      'No fue posible cargar las áreas comunes.',
                    )}
                  </Text>
                ) : selectedArea ? (
                  <View className="gap-3 rounded-2xl border border-light-gray dark:border-[#3B3345] bg-[#F8F7FA] dark:bg-[#18131F] p-4">
                    <Text className="font-heading text-xl text-primary dark:text-[#F7F2FB]">
                      {selectedArea.name}
                    </Text>
                    <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                      {selectedArea.description?.trim() || 'Sin descripción registrada.'}
                    </Text>
                    <Text className="font-body text-sm text-primary dark:text-[#F7F2FB]">
                      Ubicación: {selectedArea.location?.trim() || 'Sin ubicación'}
                    </Text>
                    <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                      {selectedArea.requiresApproval
                        ? 'Requiere aprobación de administración.'
                        : 'Reserva directa.'}
                    </Text>
                  </View>
                ) : (
                  <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                    Selecciona un área para ver su detalle.
                  </Text>
                )}
              </View>
            </Card>
          </View>

          <View className="gap-5 lg:w-[58%]">
            <Card width="full">
              <View className="gap-4">
                <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                  Disponibilidad diaria
                </Text>
                <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                  Se muestran los slots reservados del día para el área seleccionada.
                </Text>

                <DatePickerField
                  label="Fecha"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minimumDate={new Date()}
                  minimumYear={2024}
                  maximumYear={2035}
                />

                {availabilityQuery.isLoading ? (
                  <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                    Consultando disponibilidad...
                  </Text>
                ) : availabilityQuery.error ? (
                  <Text className="font-body text-sm text-danger">
                    {getErrorMessage(
                      availabilityQuery.error,
                      'No fue posible cargar la disponibilidad.',
                    )}
                  </Text>
                ) : upcomingAvailabilitySlots.length ? (
                  <View className="gap-3">
                    {upcomingAvailabilitySlots.map((slot) => (
                      <Pressable
                        key={`daily-${slot.startAt}`}
                        disabled={
                          !slot.canReserve ||
                          !hasLinkedCondomino ||
                          !condominiumQuery.data?.units.length
                        }
                        onPress={() => openReservationSheet(slot)}
                        className={`gap-2 rounded-2xl border px-4 py-4 ${
                          slot.canReserve
                            ? 'border-[#A8DDBA] bg-[#F5FCF7] dark:bg-[#20352A] active:opacity-70'
                            : 'border-light-gray dark:border-[#3B3345] bg-white dark:bg-[#211A29]'
                        }`}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-1">
                            <Text className="font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
                              {formatTimeRange(
                                slot.startAt,
                                slot.endAt,
                                availabilityQuery.data?.area.timeZone ??
                                  selectedArea?.timeZone ??
                                  'America/Mexico_City',
                              )}
                            </Text>
                            <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                              {formatDate(
                                slot.startAt,
                                availabilityQuery.data?.area.timeZone ??
                                  selectedArea?.timeZone ??
                                  'America/Mexico_City',
                              )}
                            </Text>
                          </View>
                          <View
                            className={`rounded-full px-3 py-1 ${availabilityTone(
                              slot.status,
                            )}`}
                          >
                            <Text className="font-body-semibold text-xs">
                              {formatAvailabilityStatus(slot.status)}
                            </Text>
                          </View>
                        </View>
                        {slot.canReserve && hasLinkedCondomino ? (
                          <Text className="font-body-semibold text-xs text-success">
                            Toca para reservar
                          </Text>
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                    No hay horarios próximos para la fecha seleccionada.
                  </Text>
                )}
              </View>
            </Card>
          </View>
        </View>

        <Card width="full">
          <View className="gap-4">
            <View className="gap-2">
              <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                Reservaciones
              </Text>
              <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                La lista inicia mostrando todas tus reservaciones del área y puedes filtrarlas por estatus o fecha.
              </Text>
            </View>

            <SelectField
              label="Estatus"
              options={reservationStatusOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              value={reservationStatusFilter}
              onChange={(value) =>
                setReservationStatusFilter(value as ReservationStatusFilter)
              }
            />

            <DatePickerField
              label="Fecha"
              value={reservationDateFilter}
              onChange={setReservationDateFilter}
              minimumYear={2024}
              maximumYear={2035}
              helperText="Opcional. Si no eliges fecha, se muestran todas."
            />

            <Button
              title="Limpiar fecha"
              variant="secondary"
              disabled={!reservationDateFilter}
              onPress={() => setReservationDateFilter(null)}
            />

            {reservationsQuery.isLoading ? (
              <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                Cargando reservaciones...
              </Text>
            ) : reservationsQuery.error ? (
              <Text className="font-body text-sm text-danger">
                {getErrorMessage(
                  reservationsQuery.error,
                  'No fue posible cargar las reservaciones.',
                )}
              </Text>
            ) : filteredReservations.length ? (
              <View className="gap-3">
                {filteredReservations.map((reservation) => (
                  <View
                    key={reservation.id}
                    className="gap-3 rounded-2xl border border-light-gray dark:border-[#3B3345] bg-white dark:bg-[#211A29] px-4 py-4"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
                          {reservation.area.name}
                        </Text>
                        <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                          {formatDate(
                            reservation.startAt,
                            reservation.area.timeZone,
                          )}{' '}
                          ·{' '}
                          {formatTimeRange(
                            reservation.startAt,
                            reservation.endAt,
                            reservation.area.timeZone,
                          )}
                        </Text>
                      </View>
                      <View
                        className={`rounded-full px-3 py-1 ${statusTone(
                          reservation.status,
                        )}`}
                      >
                        <Text className="font-body-semibold text-xs">
                          {formatStatus(reservation.status)}
                        </Text>
                      </View>
                    </View>

                    {reservation.notes ? (
                      <Text className="font-body text-sm text-primary dark:text-[#F7F2FB]">
                        Nota: {reservation.notes}
                      </Text>
                    ) : null}

                    {reservation.cancelReason ? (
                      <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                        Motivo cancelación: {reservation.cancelReason}
                      </Text>
                    ) : null}

                    {reservation.status === 'APPROVED' ||
                    reservation.status === 'PENDING' ? (
                      <Button
                        title="Cancelar reservación"
                        variant="secondary"
                        onPress={() => {
                          setSelectedReservation(reservation);
                          setCancelReason('');
                          setCancelError('');
                          setIsCancelSheetOpen(true);
                        }}
                      />
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                No hay reservaciones que coincidan con los filtros seleccionados.
              </Text>
            )}
          </View>
        </Card>
      </View>

      <BottomSheet
        visible={isReservationSheetOpen}
        title="Nueva reservación"
        onClose={() => setIsReservationSheetOpen(false)}
        footer={
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              title="Cancelar"
              variant="outline"
              onPress={() => setIsReservationSheetOpen(false)}
            />
            <Button
              className="flex-1"
              title="Reservar"
              loading={createReservationMutation.isPending}
              onPress={handleCreateReservation}
            />
          </View>
        }
      >
        <View className="gap-4">
          {selectedArea ? (
            <View className="gap-1 rounded-2xl border border-light-gray dark:border-[#3B3345] bg-[#F8F7FA] dark:bg-[#18131F] px-4 py-4">
              <Text className="font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
                {selectedArea.name}
              </Text>
              <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                {formatDate(selectedDate.toISOString())}
                {reservationStartTime && reservationEndTime
                  ? ` · ${formatTimeRange(
                      reservationStartTime,
                      reservationEndTime,
                      selectedArea.timeZone,
                    )}`
                  : ''}
              </Text>
            </View>
          ) : null}

          <SelectField
            label="Unidad"
            options={unitOptions}
            value={selectedUnitId}
            onChange={setSelectedUnitId}
          />

          <InputField
            label="Notas"
            placeholder="Opcional"
            value={notes}
            onChangeText={setNotes}
          />

          {reservationError ? (
            <Text className="font-body text-sm text-danger">
              {reservationError}
            </Text>
          ) : null}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={isCancelSheetOpen}
        title="Cancelar reservación"
        onClose={() => setIsCancelSheetOpen(false)}
        footer={
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              title="Cancelar"
              variant="outline"
              onPress={() => setIsCancelSheetOpen(false)}
            />
            <Button
              className="flex-1"
              title="Confirmar"
              loading={cancelReservationMutation.isPending}
              onPress={handleCancelReservation}
            />
          </View>
        }
      >
        <View className="gap-4">
          {selectedReservation ? (
            <View className="gap-1 rounded-2xl border border-light-gray dark:border-[#3B3345] bg-[#F8F7FA] dark:bg-[#18131F] px-4 py-4">
              <Text className="font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
                {selectedReservation.area.name}
              </Text>
              <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
                {formatDate(
                  selectedReservation.startAt,
                  selectedReservation.area.timeZone,
                )}{' '}
                ·{' '}
                {formatTimeRange(
                  selectedReservation.startAt,
                  selectedReservation.endAt,
                  selectedReservation.area.timeZone,
                )}
              </Text>
            </View>
          ) : null}

          <InputField
            label="Motivo"
            placeholder="Opcional"
            value={cancelReason}
            onChangeText={setCancelReason}
          />

          {cancelError ? (
            <Text className="font-body text-sm text-danger">{cancelError}</Text>
          ) : null}
        </View>
      </BottomSheet>
    </>
  );
}

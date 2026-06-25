import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import DatePickerField from '../components/molecules/DatePickerField';
import InputField from '../components/molecules/InputField';
import SelectField from '../components/molecules/SelectField';
import { BottomSheet } from '../components/molecules/fieldShared';
import {
  buildCommonAreaDateTimeIso,
  cancelCommonAreaReservation,
  createCommonAreaReservation,
  createTimeOptions,
  getCommonAreaReservations,
  getCommonAreas,
} from '../services/commonAreas';
import { getMyCondominoDetail } from '../services/condomino';
import { getErrorMessage, getHttpStatus } from '../services/error';
import { queryKeys } from '../services/queryKeys';
import type {
  CommonAreaDto,
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startAt} - ${endAt}`;
  }

  const formatter = new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
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
    return 'bg-[#E8F7EE] text-success';
  }

  if (status === 'REJECTED') {
    return 'bg-[#FDECEC] text-danger';
  }

  if (status === 'CANCELLED') {
    return 'bg-[#EEF0F3] text-med-gray';
  }

  return 'bg-[#FFF7E6] text-warning';
}

function isSameDay(dateString: string, selectedDate: Date) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === selectedDate.getFullYear() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getDate() === selectedDate.getDate()
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
  const [reservationDate, setReservationDate] = useState<Date>(new Date());
  const [reservationStartTime, setReservationStartTime] = useState<string | null>(null);
  const [reservationEndTime, setReservationEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');

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

  const createReservationMutation = useMutation({
    mutationFn: createCommonAreaReservation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.commonAreaReservations(
          selectedAreaId ? Number(selectedAreaId) : null,
        ),
      });
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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.commonAreaReservations(
          selectedAreaId ? Number(selectedAreaId) : null,
        ),
      });
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

  const dailyReservations = useMemo(
    () =>
      reservations
        .filter((reservation) => isSameDay(reservation.startAt, selectedDate))
        .sort(
          (left, right) =>
            new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
        ),
    [reservations, selectedDate],
  );

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
            ? isSameDay(reservation.startAt, reservationDateFilter)
            : true,
        )
        .sort(
          (left, right) =>
            new Date(right.startAt).getTime() - new Date(left.startAt).getTime(),
        ),
    [reservationDateFilter, reservationStatusFilter, reservations],
  );

  const timeOptions = useMemo(
    () => (selectedArea ? createTimeOptions() : []),
    [selectedArea],
  );

  const startTimeOptions = useMemo(
    () => timeOptions.slice(0, Math.max(0, timeOptions.length - 1)),
    [timeOptions],
  );

  const endTimeOptions = useMemo(() => {
    if (!reservationStartTime) {
      return timeOptions.slice(1);
    }

    const startIndex = timeOptions.findIndex(
      (option) => option.value === reservationStartTime,
    );

    if (startIndex < 0) {
      return timeOptions.slice(1);
    }

    return timeOptions.slice(startIndex + 1);
  }, [reservationStartTime, timeOptions]);

  useEffect(() => {
    if (!startTimeOptions.length) {
      setReservationStartTime(null);
      setReservationEndTime(null);
      return;
    }

    setReservationStartTime((current) =>
      current && startTimeOptions.some((option) => option.value === current)
        ? current
        : startTimeOptions[0]?.value ?? null,
    );
  }, [startTimeOptions]);

  useEffect(() => {
    if (!endTimeOptions.length) {
      setReservationEndTime(null);
      return;
    }

    setReservationEndTime((current) =>
      current && endTimeOptions.some((option) => option.value === current)
        ? current
        : endTimeOptions[0]?.value ?? null,
    );
  }, [endTimeOptions]);

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.commonAreas }),
      queryClient.invalidateQueries({ queryKey: queryKeys.condominiumDetail }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.commonAreaReservations(
          selectedAreaId ? Number(selectedAreaId) : null,
        ),
      }),
    ]);
  };

  const openReservationSheet = () => {
    setReservationDate(selectedDate);
    setNotes('');
    setReservationError('');
    setIsReservationSheetOpen(true);
  };

  const handleCreateReservation = () => {
    if (!selectedArea || !selectedUnitId || !reservationStartTime || !reservationEndTime) {
      setReservationError('Completa área, unidad y horario.');
      return;
    }

    createReservationMutation.mutate(
      {
        commonAreaId: selectedArea.id,
        unitId: Number(selectedUnitId),
        startAt: buildCommonAreaDateTimeIso(reservationDate, reservationStartTime),
        endAt: buildCommonAreaDateTimeIso(reservationDate, reservationEndTime),
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
            <Text className="font-heading text-2xl text-primary">
              Áreas comunes
            </Text>
            <Text className="font-body text-base text-med-gray">
              Consulta horarios reservados del día y administra tus reservaciones.
            </Text>
          </View>

          {!hasLinkedCondomino ? (
            <View className="rounded-2xl border border-[#F6C77A] bg-[#FFF7E6] px-4 py-4">
              <Text className="font-body text-sm text-primary">
                Tu cuenta no tiene un condomino vinculado. Puedes consultar disponibilidad,
                pero no crear reservaciones hasta que se vincule tu perfil.
              </Text>
            </View>
          ) : null}

          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              icon="add-circle-outline"
              title="Nueva reservación"
              disabled={
                !selectedArea ||
                !condominiumQuery.data?.units.length ||
                createReservationMutation.isPending
              }
              onPress={openReservationSheet}
            />
            <Button
              className="flex-1"
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
                  <Text className="font-body text-sm text-med-gray">
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
                  <View className="gap-3 rounded-2xl border border-light-gray bg-[#F8F7FA] p-4">
                    <Text className="font-heading text-xl text-primary">
                      {selectedArea.name}
                    </Text>
                    <Text className="font-body text-sm text-med-gray">
                      {selectedArea.description?.trim() || 'Sin descripción registrada.'}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Ubicación: {selectedArea.location?.trim() || 'Sin ubicación'}
                    </Text>
                    <Text className="font-body text-sm text-med-gray">
                      {selectedArea.requiresApproval
                        ? 'Requiere aprobación de administración.'
                        : 'Reserva directa.'}
                    </Text>
                  </View>
                ) : (
                  <Text className="font-body text-sm text-med-gray">
                    Selecciona un área para ver su detalle.
                  </Text>
                )}
              </View>
            </Card>
          </View>

          <View className="gap-5 lg:w-[58%]">
            <Card width="full">
              <View className="gap-4">
                <Text className="font-heading text-lg text-primary">
                  Disponibilidad diaria
                </Text>
                <Text className="font-body text-sm text-med-gray">
                  Se muestran los slots reservados del día para el área seleccionada.
                </Text>

                <DatePickerField
                  label="Fecha"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minimumYear={2024}
                  maximumYear={2035}
                />

                {condominiumQuery.isLoading || reservationsQuery.isLoading ? (
                  <Text className="font-body text-sm text-med-gray">
                    Consultando reservaciones del día...
                  </Text>
                ) : reservationsQuery.error ? (
                  <Text className="font-body text-sm text-danger">
                    {getErrorMessage(
                      reservationsQuery.error,
                      'No fue posible cargar las reservaciones.',
                    )}
                  </Text>
                ) : dailyReservations.length ? (
                  <View className="gap-3">
                    {dailyReservations.map((reservation) => (
                      <View
                        key={`daily-${reservation.id}`}
                        className="gap-2 rounded-2xl border border-light-gray bg-white px-4 py-4"
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-1">
                            <Text className="font-body-semibold text-base text-primary">
                              {formatTimeRange(
                                reservation.startAt,
                                reservation.endAt,
                              )}
                            </Text>
                            <Text className="font-body text-sm text-med-gray">
                              {formatDate(reservation.startAt)}
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
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="font-body text-sm text-med-gray">
                    No hay horarios reservados para la fecha seleccionada.
                  </Text>
                )}
              </View>
            </Card>
          </View>
        </View>

        <Card width="full">
          <View className="gap-4">
            <View className="gap-2">
              <Text className="font-heading text-lg text-primary">
                Reservaciones
              </Text>
              <Text className="font-body text-sm text-med-gray">
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
              <Text className="font-body text-sm text-med-gray">
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
                    className="gap-3 rounded-2xl border border-light-gray bg-white px-4 py-4"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="font-body-semibold text-base text-primary">
                          {reservation.area.name}
                        </Text>
                        <Text className="font-body text-sm text-med-gray">
                          {formatDate(reservation.startAt)} ·{' '}
                          {formatTimeRange(reservation.startAt, reservation.endAt)}
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
                      <Text className="font-body text-sm text-primary">
                        Nota: {reservation.notes}
                      </Text>
                    ) : null}

                    {reservation.cancelReason ? (
                      <Text className="font-body text-sm text-med-gray">
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
              <Text className="font-body text-sm text-med-gray">
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
          <DatePickerField
            label="Fecha"
            value={reservationDate}
            onChange={setReservationDate}
            minimumYear={2024}
            maximumYear={2035}
          />

          <SelectField
            label="Unidad"
            options={unitOptions}
            value={selectedUnitId}
            onChange={setSelectedUnitId}
          />

          <SelectField
            label="Hora de inicio"
            options={startTimeOptions}
            value={reservationStartTime}
            onChange={setReservationStartTime}
          />

          <SelectField
            label="Hora de fin"
            options={endTimeOptions}
            value={reservationEndTime}
            onChange={setReservationEndTime}
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
            <View className="gap-1 rounded-2xl border border-light-gray bg-[#F8F7FA] px-4 py-4">
              <Text className="font-body-semibold text-base text-primary">
                {selectedReservation.area.name}
              </Text>
              <Text className="font-body text-sm text-med-gray">
                {formatDate(selectedReservation.startAt)} ·{' '}
                {formatTimeRange(
                  selectedReservation.startAt,
                  selectedReservation.endAt,
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

import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CameraView,
  type BarcodeScanningResult,
  useCameraPermissions,
} from 'expo-camera';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import DatePickerField from '../components/molecules/DatePickerField';
import InputField from '../components/molecules/InputField';
import SelectField from '../components/molecules/SelectField';
import MobileTabs from '../components/organisms/MobileTabs';
import { getMe } from '../services/auth';
import { getMyCondominoDetail } from '../services/condomino';
import {
  getErrorMessage,
  getHttpStatus,
  isUnauthorizedError,
} from '../services/error';
import { queryKeys } from '../services/queryKeys';
import {
  cancelVisitorAccess,
  createVisitorAccess,
  getMyVisitorAccesses,
  getOperatorTodayVisitorAccessLogs,
  registerVisitorAccessEntry,
  registerVisitorAccessExit,
  validateVisitorAccess,
} from '../services/visitorAccess';
import type {
  CreateVisitorAccessPayload,
  UserRole,
  ValidateVisitorAccessResponse,
  VisitorAccessCreatedDto,
  VisitorAccessDto,
  VisitorAccessLogEntryDto,
  VisitorAccessStatus,
  VisitorAccessType,
} from '../services/types';

const visitTypeOptions: Array<{ label: string; value: VisitorAccessType }> = [
  { label: 'Visitante', value: 'VISITOR' },
  { label: 'Proveedor', value: 'PROVIDER' },
  { label: 'Paquetería', value: 'DELIVERY' },
  { label: 'Mudanza', value: 'MOVE' },
  { label: 'Mantenimiento', value: 'MAINTENANCE' },
  { label: 'Transporte', value: 'RIDE_SERVICE' },
  { label: 'Otro', value: 'OTHER' },
];

const visitTypeLabels: Record<VisitorAccessType, string> = {
  VISITOR: 'Visitante',
  PROVIDER: 'Proveedor',
  DELIVERY: 'Paquetería',
  MOVE: 'Mudanza',
  MAINTENANCE: 'Mantenimiento',
  RIDE_SERVICE: 'Transporte',
  OTHER: 'Otro',
};

const statusLabels: Record<VisitorAccessStatus, string> = {
  PENDING_APPROVAL: 'Pendiente',
  ACTIVE: 'Activo',
  USED: 'Usado',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
  REJECTED: 'Rechazado',
};

function formatDateTime(value?: string | null, fallback = 'Sin fecha') {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatVisitType(value: VisitorAccessType) {
  return visitTypeLabels[value] ?? value;
}

function formatStatus(value: VisitorAccessStatus) {
  return statusLabels[value] ?? value;
}

function statusTone(status: VisitorAccessStatus) {
  if (status === 'ACTIVE') {
    return 'bg-[#E8F7EE] text-success';
  }

  if (status === 'USED') {
    return 'bg-[#E8F1FE] text-[#2D5BBD]';
  }

  if (status === 'PENDING_APPROVAL') {
    return 'bg-[#FFF7E6] text-warning';
  }

  if (status === 'REJECTED') {
    return 'bg-[#FDECEC] text-danger';
  }

  return 'bg-[#EEF0F3] text-med-gray';
}

function formatVehicle(
  vehicle:
    | ValidateVisitorAccessResponse['vehicle']
    | VisitorAccessLogEntryDto['access']['vehicle']
    | VisitorAccessDto['vehicle'],
) {
  return [vehicle.plate, vehicle.brand, vehicle.color].filter(Boolean).join(' · ') || 'Sin vehículo';
}

function buildLogSummary(log: VisitorAccessLogEntryDto) {
  const parts = [
    log.access.resident?.name ? `Residente: ${log.access.resident.name}` : null,
    log.access.visitorPhone ? `Teléfono: ${log.access.visitorPhone}` : null,
    log.access.companyName ? `Empresa: ${log.access.companyName}` : null,
    log.access.trackingNumber ? `Rastreo: ${log.access.trackingNumber}` : null,
    log.access.peopleCount ? `Personas: ${log.access.peopleCount}` : null,
  ].filter(Boolean);

  return parts.join(' · ');
}

function createTimeOptions() {
  const output: Array<{ label: string; value: string }> = [];

  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      output.push({ label: value, value });
    }
  }

  return output;
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined.toISOString();
}

function createInitialResidentForm() {
  const now = new Date();
  const startDate = new Date(now.getTime() + 30 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  return {
    visitorName: '',
    visitType: 'VISITOR' as VisitorAccessType,
    visitorPhone: '',
    companyName: '',
    trackingNumber: '',
    peopleCount: '',
    vehiclePlate: '',
    vehicleBrand: '',
    vehicleColor: '',
    validFromDate: startDate,
    validFromTime: `${String(startDate.getHours()).padStart(2, '0')}:${startDate.getMinutes() >= 30 ? '30' : '00'}`,
    validToDate: endDate,
    validToTime: `${String(endDate.getHours()).padStart(2, '0')}:${endDate.getMinutes() >= 30 ? '30' : '00'}`,
  };
}

function canCancelAccess(status: VisitorAccessStatus) {
  return status === 'ACTIVE' || status === 'PENDING_APPROVAL';
}

function buildVisitorPayload(
  form: ReturnType<typeof createInitialResidentForm>,
): CreateVisitorAccessPayload {
  return {
    visitorName: form.visitorName.trim(),
    visitType: form.visitType,
    visitorPhone: form.visitorPhone.trim() || undefined,
    companyName: form.companyName.trim() || undefined,
    trackingNumber: form.trackingNumber.trim() || undefined,
    peopleCount: form.peopleCount.trim()
      ? Number(form.peopleCount)
      : undefined,
    vehiclePlate: form.vehiclePlate.trim() || undefined,
    vehicleBrand: form.vehicleBrand.trim() || undefined,
    vehicleColor: form.vehicleColor.trim() || undefined,
    validFrom: combineDateAndTime(form.validFromDate, form.validFromTime),
    validTo: combineDateAndTime(form.validToDate, form.validToTime),
  };
}

interface VisitorAccessProps {
  role?: UserRole;
  onUnauthorized?: () => void;
  onCreatedAccess?: (access: VisitorAccessCreatedDto) => void;
}

export default function VisitorAccess({
  role,
  onUnauthorized,
  onCreatedAccess,
}: VisitorAccessProps) {
  const isOperator = role === 'ACCESS_OPERATOR';
  const queryClient = useQueryClient();
  const [permissions, requestPermission] = useCameraPermissions();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [operatorError, setOperatorError] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [guardName, setGuardName] = useState('');
  const [guardNotes, setGuardNotes] = useState('');
  const [validatedAccess, setValidatedAccess] =
    useState<ValidateVisitorAccessResponse | null>(null);
  const scannedTokenRef = useRef<string | null>(null);

  const [residentForm, setResidentForm] = useState(() =>
    createInitialResidentForm(),
  );
  const [residentError, setResidentError] = useState('');

  const operatorLogsQuery = useQuery({
    queryKey: queryKeys.visitorAccessToday,
    queryFn: getOperatorTodayVisitorAccessLogs,
    enabled: isOperator,
  });

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: !isOperator,
  });

  const condominoQuery = useQuery({
    queryKey: queryKeys.condominiumDetail,
    queryFn: getMyCondominoDetail,
    enabled: !isOperator,
  });

  const myAccessesQuery = useQuery({
    queryKey: queryKeys.visitorAccessMine,
    queryFn: getMyVisitorAccesses,
    enabled: !isOperator,
  });

  const handleUnauthorized = useCallback(async () => {
    await onUnauthorized?.();
  }, [onUnauthorized]);

  const validateMutation = useMutation({
    mutationFn: validateVisitorAccess,
    onSuccess: (data) => {
      setValidatedAccess(data);
      setOperatorError('');
    },
    onError: async (error) => {
      setValidatedAccess(null);
      setOperatorError(
        getErrorMessage(error, 'No fue posible validar el acceso.'),
      );

      if (isUnauthorizedError(error)) {
        await handleUnauthorized();
      }
    },
  });

  const entryMutation = useMutation({
    mutationFn: ({
      accessId,
      guardName,
      notes,
    }: {
      accessId: number;
      guardName: string;
      notes?: string;
    }) => registerVisitorAccessEntry(accessId, { guardName, notes }),
    onSuccess: async () => {
      setValidatedAccess(null);
      setQrToken('');
      setGuardNotes('');
      setOperatorError('');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.visitorAccessToday,
      });
    },
    onError: async (error) => {
      setOperatorError(
        getErrorMessage(error, 'No fue posible registrar la entrada.'),
      );

      if (isUnauthorizedError(error)) {
        await handleUnauthorized();
      }
    },
  });

  const exitMutation = useMutation({
    mutationFn: ({
      accessId,
      guardName,
      notes,
    }: {
      accessId: number;
      guardName: string;
      notes?: string;
    }) => registerVisitorAccessExit(accessId, { guardName, notes }),
    onSuccess: async () => {
      setValidatedAccess(null);
      setQrToken('');
      setGuardNotes('');
      setOperatorError('');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.visitorAccessToday,
      });
    },
    onError: async (error) => {
      setOperatorError(
        getErrorMessage(error, 'No fue posible registrar la salida.'),
      );

      if (isUnauthorizedError(error)) {
        await handleUnauthorized();
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: createVisitorAccess,
    onSuccess: async (data) => {
      setResidentError('');
      setResidentForm(createInitialResidentForm());
      await queryClient.invalidateQueries({
        queryKey: queryKeys.visitorAccessMine,
      });
      onCreatedAccess?.(data);
    },
    onError: async (error) => {
      setResidentError(
        getErrorMessage(error, 'No fue posible crear el acceso.'),
      );

      if (isUnauthorizedError(error)) {
        await handleUnauthorized();
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelVisitorAccess,
    onSuccess: async () => {
      setResidentError('');
      await queryClient.invalidateQueries({
        queryKey: queryKeys.visitorAccessMine,
      });
    },
    onError: async (error) => {
      setResidentError(
        getErrorMessage(error, 'No fue posible cancelar el acceso.'),
      );

      if (isUnauthorizedError(error)) {
        await handleUnauthorized();
      }
    },
  });

  useEffect(() => {
    const queryError = isOperator
      ? operatorLogsQuery.error
      : condominoQuery.error ?? myAccessesQuery.error;

    if (queryError && isUnauthorizedError(queryError)) {
      void handleUnauthorized();
    }
  }, [
    condominoQuery.error,
    handleUnauthorized,
    isOperator,
    myAccessesQuery.error,
    operatorLogsQuery.error,
  ]);

  const timeOptions = useMemo(() => createTimeOptions(), []);
  const todayLogs = operatorLogsQuery.data ?? [];
  const myAccesses = myAccessesQuery.data ?? [];
  const residentUnits = condominoQuery.data?.units ?? [];
  const residentCanCreate = residentUnits.length === 1;
  const hasLinkedCondomino = getHttpStatus(condominoQuery.error) !== 404;
  const enabledVisitTypes =
    meQuery.data?.currentCondominium?.enabledVisitorAccessTypes ?? [];
  const availableVisitTypeOptions = useMemo(
    () =>
      visitTypeOptions.filter((option) =>
        enabledVisitTypes.includes(option.value),
      ),
    [enabledVisitTypes],
  );

  const operatorMetrics = useMemo(
    () => [
      { label: 'Registros hoy', value: todayLogs.length },
      { label: 'Con entrada', value: todayLogs.filter((item) => item.entryAt).length },
      { label: 'Con salida', value: todayLogs.filter((item) => item.exitAt).length },
    ],
    [todayLogs],
  );

  const residentMetrics = useMemo(
    () => [
      { label: 'Mis accesos', value: myAccesses.length },
      {
        label: 'Activos',
        value: myAccesses.filter((item) => item.status === 'ACTIVE').length,
      },
      {
        label: 'Pendientes',
        value: myAccesses.filter((item) => item.status === 'PENDING_APPROVAL').length,
      },
    ],
    [myAccesses],
  );

  const isBusy = validateMutation.isPending || entryMutation.isPending || exitMutation.isPending;

  useEffect(() => {
    if (!availableVisitTypeOptions.length) {
      return;
    }

    if (
      availableVisitTypeOptions.some(
        (option) => option.value === residentForm.visitType,
      )
    ) {
      return;
    }

    setResidentForm((current) => ({
      ...current,
      visitType: availableVisitTypeOptions[0].value,
    }));
  }, [availableVisitTypeOptions, residentForm.visitType]);

  const handleValidate = useCallback(
    async (tokenValue: string) => {
      const normalizedToken = tokenValue.trim();

      if (!normalizedToken) {
        setOperatorError('Captura o escanea un token QR.');
        return;
      }

      setQrToken(normalizedToken);
      await validateMutation.mutateAsync({ qrToken: normalizedToken });
    },
    [validateMutation],
  );

  const handleOpenScanner = useCallback(async () => {
    setScannerError('');

    if (!permissions?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        setScannerError(
          'La app necesita permiso de cámara para escanear el QR.',
        );
        return;
      }
    }

    scannedTokenRef.current = null;
    setScannerOpen(true);
  }, [permissions?.granted, requestPermission]);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      const nextToken = result.data?.trim();

      if (!nextToken || scannedTokenRef.current === nextToken) {
        return;
      }

      scannedTokenRef.current = nextToken;
      setScannerOpen(false);
      void handleValidate(nextToken);
    },
    [handleValidate],
  );

  const handleRegisterEntry = useCallback(async () => {
    if (!validatedAccess) {
      setOperatorError('Primero valida un acceso.');
      return;
    }

    if (!guardName.trim()) {
      setOperatorError('El nombre del guardia es obligatorio.');
      return;
    }

    await entryMutation.mutateAsync({
      accessId: validatedAccess.accessId,
      guardName: guardName.trim(),
      notes: guardNotes.trim() || undefined,
    });
  }, [entryMutation, guardName, guardNotes, validatedAccess]);

  const handleRegisterExit = useCallback(async () => {
    if (!validatedAccess) {
      setOperatorError('Primero valida un acceso.');
      return;
    }

    if (!guardName.trim()) {
      setOperatorError('El nombre del guardia es obligatorio.');
      return;
    }

    await exitMutation.mutateAsync({
      accessId: validatedAccess.accessId,
      guardName: guardName.trim(),
      notes: guardNotes.trim() || undefined,
    });
  }, [exitMutation, guardName, guardNotes, validatedAccess]);

  const handleCreateAccess = useCallback(async () => {
    if (!residentCanCreate) {
      setResidentError(
        residentUnits.length > 1
          ? 'Tu cuenta tiene varias viviendas vinculadas y la app aún no puede elegir una automáticamente.'
          : 'Tu cuenta no tiene una vivienda vinculada para generar accesos.',
      );
      return;
    }

    if (!residentForm.visitorName.trim()) {
      setResidentError('El nombre del visitante es obligatorio.');
      return;
    }

    if (!availableVisitTypeOptions.length) {
      setResidentError(
        'Este condominio no tiene tipos de acceso activos. Deben habilitarse desde la gestión del condominio.',
      );
      return;
    }

    const payload = buildVisitorPayload(residentForm);
    if (new Date(payload.validFrom) >= new Date(payload.validTo)) {
      setResidentError('La vigencia del acceso no es válida.');
      return;
    }

    await createMutation.mutateAsync(payload);
  }, [
    availableVisitTypeOptions.length,
    createMutation,
    residentCanCreate,
    residentForm,
    residentUnits.length,
  ]);

  const residentQueryError = useMemo(() => {
    if (!condominoQuery.error && !myAccessesQuery.error) {
      return '';
    }

    const error = condominoQuery.error ?? myAccessesQuery.error;

    if (getHttpStatus(error) === 404) {
      return 'Tu cuenta no tiene un condómino vinculado en el backend.';
    }

    return getErrorMessage(error, 'No fue posible cargar tus accesos.');
  }, [condominoQuery.error, myAccessesQuery.error]);

  const operatorQueryError = useMemo(() => {
    if (!operatorLogsQuery.error) {
      return '';
    }

    if (getHttpStatus(operatorLogsQuery.error) === 403) {
      return 'Este usuario no tiene permisos de operador de accesos.';
    }

    return getErrorMessage(
      operatorLogsQuery.error,
      'No fue posible cargar la bitácora.',
    );
  }, [operatorLogsQuery.error]);

  const residentTabs = useMemo(
    () => [
      {
        key: 'create',
        label: 'Solicitar',
        content: (
          <View className="gap-4">
            {!hasLinkedCondomino ? (
              <View className="rounded-2xl border border-[#F1A2A2] bg-[#FDECEC] px-4 py-3">
                <Text className="font-body text-sm text-danger">
                  Tu cuenta no tiene un condómino vinculado en el backend.
                </Text>
              </View>
            ) : null}

            {hasLinkedCondomino && !residentCanCreate ? (
              <View className="rounded-2xl border border-[#F5C79A] bg-[#FFF7E6] px-4 py-3">
                <Text className="font-body text-sm text-warning">
                  Tu cuenta tiene {residentUnits.length || 0} viviendas vinculadas. Por ahora la app móvil solo puede crear accesos cuando existe exactamente una vivienda asociada.
                </Text>
              </View>
            ) : null}

            {!availableVisitTypeOptions.length ? (
              <View className="rounded-2xl border border-[#F5C79A] bg-[#FFF7E6] px-4 py-3">
                <Text className="font-body text-sm text-warning">
                  Este condominio no tiene tipos de acceso activos. Deben habilitarse desde la gestión del condominio.
                </Text>
              </View>
            ) : null}

            <InputField
              editable={!createMutation.isPending}
              label="Nombre del visitante"
              value={residentForm.visitorName}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, visitorName: value }))
              }
            />

            <SelectField
              disabled={createMutation.isPending || !availableVisitTypeOptions.length}
              label="Tipo de acceso"
              options={availableVisitTypeOptions}
              value={residentForm.visitType}
              onChange={(value) =>
                setResidentForm((current) => ({
                  ...current,
                  visitType: value as VisitorAccessType,
                }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              keyboardType="phone-pad"
              label="Teléfono"
              value={residentForm.visitorPhone}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, visitorPhone: value }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              label="Empresa"
              value={residentForm.companyName}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, companyName: value }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              label="Número de rastreo"
              value={residentForm.trackingNumber}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, trackingNumber: value }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              keyboardType="numeric"
              label="Cantidad de personas"
              value={residentForm.peopleCount}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, peopleCount: value }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              label="Placa"
              value={residentForm.vehiclePlate}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, vehiclePlate: value }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              label="Marca"
              value={residentForm.vehicleBrand}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, vehicleBrand: value }))
              }
            />

            <InputField
              editable={!createMutation.isPending}
              label="Color"
              value={residentForm.vehicleColor}
              onChangeText={(value) =>
                setResidentForm((current) => ({ ...current, vehicleColor: value }))
              }
            />

            <DatePickerField
              disabled={createMutation.isPending}
              label="Válido desde"
              maximumYear={new Date().getFullYear() + 2}
              minimumYear={new Date().getFullYear()}
              value={residentForm.validFromDate}
              onChange={(value) =>
                setResidentForm((current) => ({ ...current, validFromDate: value }))
              }
            />

            <SelectField
              disabled={createMutation.isPending}
              label="Hora de inicio"
              options={timeOptions}
              value={residentForm.validFromTime}
              onChange={(value) =>
                setResidentForm((current) => ({ ...current, validFromTime: value }))
              }
            />

            <DatePickerField
              disabled={createMutation.isPending}
              label="Válido hasta"
              maximumYear={new Date().getFullYear() + 2}
              minimumYear={new Date().getFullYear()}
              value={residentForm.validToDate}
              onChange={(value) =>
                setResidentForm((current) => ({ ...current, validToDate: value }))
              }
            />

            <SelectField
              disabled={createMutation.isPending}
              label="Hora de fin"
              options={timeOptions}
              value={residentForm.validToTime}
              onChange={(value) =>
                setResidentForm((current) => ({ ...current, validToTime: value }))
              }
            />

            {residentError ? (
              <View className="rounded-2xl border border-[#F1A2A2] bg-[#FDECEC] px-4 py-3">
                <Text className="font-body text-sm text-danger">
                  {residentError}
                </Text>
              </View>
            ) : null}

            <Button
              disabled={!residentCanCreate || !availableVisitTypeOptions.length}
              loading={createMutation.isPending}
              title="Crear acceso"
              onPress={() => {
                void handleCreateAccess();
              }}
            />

          </View>
        ),
      },
      {
        key: 'mine',
        label: 'Mis accesos',
        content: (
          <View className="gap-4">
            {myAccessesQuery.isLoading ? (
              <Text className="font-body text-sm text-med-gray">
                Cargando accesos...
              </Text>
            ) : residentQueryError ? (
              <View className="rounded-2xl border border-[#F1A2A2] bg-[#FDECEC] px-4 py-3">
                <Text className="font-body text-sm text-danger">
                  {residentQueryError}
                </Text>
              </View>
            ) : myAccesses.length === 0 ? (
              <Text className="font-body text-sm text-med-gray">
                Todavía no has generado accesos.
              </Text>
            ) : (
              myAccesses.map((access) => (
                <View
                  key={access.id}
                  className="rounded-3xl border border-[#ECE8F3] bg-white px-4 py-4"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-body-semibold text-base text-primary">
                        {access.visitorName}
                      </Text>
                      <Text className="mt-1 font-body text-sm text-med-gray">
                        {formatVisitType(access.visitType)} · Casa {access.unit.houseNumber}
                      </Text>
                    </View>
                    <View className={`rounded-full px-3 py-1 ${statusTone(access.status)}`}>
                      <Text className="font-body-semibold text-xs">
                        {formatStatus(access.status)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 gap-1">
                    <Text className="font-body text-sm text-primary">
                      Vigencia: {formatDateTime(access.validFrom)} - {formatDateTime(access.validTo)}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Vehículo: {formatVehicle(access.vehicle)}
                    </Text>
                    {access.rejectionReason ? (
                      <Text className="font-body text-sm text-danger">
                        Motivo rechazo: {access.rejectionReason}
                      </Text>
                    ) : null}
                  </View>

                  {canCancelAccess(access.status) ? (
                    <Button
                      className="mt-4"
                      loading={
                        cancelMutation.isPending &&
                        cancelMutation.variables === access.id
                      }
                      title="Cancelar acceso"
                      variant="outline"
                      onPress={() => {
                        void cancelMutation.mutateAsync(access.id);
                      }}
                    />
                  ) : null}
                </View>
              ))
            )}
          </View>
        ),
      },
    ],
    [
      availableVisitTypeOptions,
      cancelMutation,
      createMutation.isPending,
      handleCreateAccess,
      hasLinkedCondomino,
      myAccesses,
      myAccessesQuery.isLoading,
      residentCanCreate,
      residentError,
      residentForm,
      residentQueryError,
      residentUnits.length,
      timeOptions,
    ],
  );

  if (isOperator) {
    return (
      <>
        <View className="gap-5">
          <View className="gap-2">
            <Text className="font-heading text-[28px] text-primary">
              Control de accesos
            </Text>
            <Text className="font-body text-sm leading-6 text-med-gray">
              Escanea el QR, valida el acceso y registra entrada o salida desde el teléfono.
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {operatorMetrics.map((metric) => (
              <Card key={metric.label} width="half">
                <Text className="font-body text-sm text-primary">{metric.label}</Text>
                <Text className="mt-2 font-heading text-2xl text-secondary">
                  {metric.value}
                </Text>
              </Card>
            ))}
          </View>

          <Card>
            <View className="gap-4">
              <Text className="font-heading text-lg text-primary">
                Escaneo móvil
              </Text>

              <Button
                className="min-h-16"
                icon="scan-outline"
                loading={validateMutation.isPending && !qrToken}
                size="lg"
                title="Abrir cámara"
                onPress={() => {
                  void handleOpenScanner();
                }}
              />

              <Text className="font-body text-sm leading-6 text-med-gray">
                La cámara se abre en pantalla completa y se cierra sola cuando detecta el código.
              </Text>

              {scannerError ? (
                <View className="rounded-2xl border border-[#F5C79A] bg-[#FFF7E6] px-4 py-3">
                  <Text className="font-body text-sm text-warning">
                    {scannerError}
                  </Text>
                </View>
              ) : null}

              <InputField
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isBusy}
                label="Token QR manual"
                placeholder="Pega o captura el token"
                value={qrToken}
                onChangeText={setQrToken}
              />

              <Button
                icon="shield-checkmark-outline"
                loading={validateMutation.isPending}
                title="Validar manualmente"
                variant="outline"
                onPress={() => {
                  void handleValidate(qrToken);
                }}
              />
            </View>
          </Card>

          <Card>
            <View className="gap-4">
              <Text className="font-heading text-lg text-primary">
                Registro operativo
              </Text>

              <InputField
                editable={!isBusy}
                label="Nombre del guardia"
                placeholder="Ej. Guardia Carlos"
                value={guardName}
                onChangeText={setGuardName}
              />

              <InputField
                editable={!isBusy}
                label="Notas operativas"
                multiline
                numberOfLines={4}
                placeholder="Observaciones del ingreso o salida"
                value={guardNotes}
                onChangeText={setGuardNotes}
              />

              {operatorError ? (
                <View className="rounded-2xl border border-[#F1A2A2] bg-[#FDECEC] px-4 py-3">
                  <Text className="font-body text-sm text-danger">
                    {operatorError}
                  </Text>
                </View>
              ) : null}

              {validatedAccess ? (
                <View className="rounded-3xl bg-[#F8F7FA] p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-heading text-lg text-primary">
                        {validatedAccess.visitorName}
                      </Text>
                      <Text className="mt-1 font-body text-sm text-med-gray">
                        {formatVisitType(validatedAccess.visitType)} · Casa {validatedAccess.unit}
                      </Text>
                    </View>
                    <View className={`rounded-full px-3 py-1 ${statusTone(validatedAccess.status)}`}>
                      <Text className="font-body-semibold text-xs">
                        {formatStatus(validatedAccess.status)}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 gap-2">
                    <Text className="font-body text-sm text-primary">
                      Residente: {validatedAccess.resident?.name ?? 'Sin residente'}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Teléfono: {validatedAccess.visitorPhone || 'Sin teléfono'}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Empresa: {validatedAccess.companyName || 'Sin empresa'}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Rastreo: {validatedAccess.trackingNumber || 'Sin rastreo'}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Personas: {validatedAccess.peopleCount ?? 'Sin dato'}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Vehículo: {formatVehicle(validatedAccess.vehicle)}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Vigencia: {formatDateTime(validatedAccess.validFrom)} - {formatDateTime(validatedAccess.validTo)}
                    </Text>
                    <Text className="font-body text-sm text-primary">
                      Creado por: {validatedAccess.createdBy.name}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="rounded-3xl bg-[#F8F7FA] px-4 py-5">
                  <Text className="font-body text-sm text-med-gray">
                    Aún no hay un acceso validado.
                  </Text>
                </View>
              )}

              <View className="flex-row gap-3">
                <Button
                  className="flex-1"
                  icon="log-in-outline"
                  loading={entryMutation.isPending}
                  title="Registrar entrada"
                  onPress={() => {
                    void handleRegisterEntry();
                  }}
                />
                <Button
                  className="flex-1"
                  icon="log-out-outline"
                  loading={exitMutation.isPending}
                  title="Registrar salida"
                  variant="secondary"
                  onPress={() => {
                    void handleRegisterExit();
                  }}
                />
              </View>
            </View>
          </Card>

          <Card>
            <View className="gap-4">
              <Text className="font-heading text-lg text-primary">
                Bitácora del día
              </Text>

              {operatorLogsQuery.isLoading ? (
                <Text className="font-body text-sm text-med-gray">
                  Cargando registros...
                </Text>
              ) : operatorQueryError ? (
                <View className="rounded-2xl border border-[#F1A2A2] bg-[#FDECEC] px-4 py-3">
                  <Text className="font-body text-sm text-danger">
                    {operatorQueryError}
                  </Text>
                </View>
              ) : todayLogs.length === 0 ? (
                <Text className="font-body text-sm text-med-gray">
                  No hay movimientos registrados hoy.
                </Text>
              ) : (
                <View className="gap-3">
                  {todayLogs.map((log) => (
                    <View
                      key={log.id}
                      className="rounded-3xl border border-[#ECE8F3] bg-white px-4 py-4"
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-body-semibold text-base text-primary">
                            {log.access.visitorName}
                          </Text>
                          <Text className="mt-1 font-body text-sm text-med-gray">
                            {formatVisitType(log.access.visitType)} · Casa {log.access.unit.houseNumber}
                          </Text>
                        </View>
                        <View className={`rounded-full px-3 py-1 ${statusTone(log.access.status)}`}>
                          <Text className="font-body-semibold text-xs">
                            {formatStatus(log.access.status)}
                          </Text>
                        </View>
                      </View>

                      {buildLogSummary(log) ? (
                        <Text className="mt-3 font-body text-sm leading-6 text-primary">
                          {buildLogSummary(log)}
                        </Text>
                      ) : null}

                      <View className="mt-3 gap-1">
                        <Text className="font-body text-sm text-primary">
                          Entrada: {formatDateTime(log.entryAt, 'Sin entrada')}
                        </Text>
                        <Text className="font-body text-sm text-primary">
                          Salida: {formatDateTime(log.exitAt, 'Sin salida')}
                        </Text>
                        <Text className="font-body text-sm text-primary">
                          Guardias: {[log.entryGuardName, log.exitGuardName].filter(Boolean).join(' / ') || 'Sin guardia'}
                        </Text>
                        <Text className="font-body text-sm text-primary">
                          Notas: {[log.entryNotes, log.exitNotes].filter(Boolean).join(' / ') || 'Sin notas'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card>
        </View>

        <Modal
          animationType="slide"
          onRequestClose={() => setScannerOpen(false)}
          transparent={false}
          visible={scannerOpen}
        >
          <SafeAreaView className="flex-1 bg-black">
            <View className="flex-row items-center justify-between px-4 py-3">
              <Text className="font-heading text-lg text-white">Escanear QR</Text>
              <Pressable
                accessibilityRole="button"
                className="rounded-full bg-white/15 px-3 py-2"
                onPress={() => setScannerOpen(false)}
              >
                <Ionicons color="#FFFFFF" name="close-outline" size={20} />
              </Pressable>
            </View>

            <View className="flex-1 overflow-hidden rounded-t-[32px] bg-black">
              <CameraView
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
                style={{ flex: 1 }}
              />

              <View className="absolute inset-x-0 bottom-0 bg-black/55 px-5 py-6">
                <Text className="font-body text-center text-sm leading-6 text-white">
                  Apunta al código QR. En cuanto se detecte, la cámara se cierra y se valida el acceso.
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </>
    );
  }

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="font-heading text-[28px] text-primary">
          Mis accesos
        </Text>
        <Text className="font-body text-sm leading-6 text-med-gray">
          Solicita pases para tus visitantes y consulta la vigencia de los accesos creados.
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-4">
        {residentMetrics.map((metric) => (
          <Card key={metric.label} width="half">
            <Text className="font-body text-sm text-primary">{metric.label}</Text>
            <Text className="mt-2 font-heading text-2xl text-secondary">
              {metric.value}
            </Text>
          </Card>
        ))}
      </View>

      <Card>
        <MobileTabs defaultActiveKey="create" items={residentTabs} />
      </Card>
    </View>
  );
}

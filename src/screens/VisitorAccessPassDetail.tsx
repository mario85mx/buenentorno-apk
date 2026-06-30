import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ElementRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import type { VisitorAccessCreatedDto, VisitorAccessStatus, VisitorAccessType } from '../services/types';

export interface VisitorAccessPassDetailProps {
  access: VisitorAccessCreatedDto;
  onBack?: () => void;
}

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

function formatVehicle(access: VisitorAccessCreatedDto) {
  return [
    access.vehicle.plate,
    access.vehicle.brand,
    access.vehicle.color,
  ]
    .filter(Boolean)
    .join(' · ') || 'Sin vehículo';
}

function statusTone(status: VisitorAccessStatus) {
  if (status === 'ACTIVE') {
    return 'bg-[#E8F7EE] text-success';
  }

  if (status === 'PENDING_APPROVAL') {
    return 'bg-[#FFF7E6] text-warning';
  }

  return 'bg-[#EEF0F3] text-med-gray';
}

export default function VisitorAccessPassDetail({
  access,
  onBack,
}: VisitorAccessPassDetailProps) {
  const shotRef = useRef<ElementRef<typeof ViewShot> | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const detailRows = useMemo(
    () => [
      { label: 'Visitante', value: access.visitorName },
      { label: 'Tipo', value: formatVisitType(access.visitType) },
      { label: 'Casa', value: `Casa ${access.unit.houseNumber}` },
      {
        label: 'Residente',
        value: access.resident?.name ?? 'Sin residente',
      },
      {
        label: 'Vigencia',
        value: `${formatDateTime(access.validFrom)} - ${formatDateTime(access.validTo)}`,
      },
      { label: 'Vehículo', value: formatVehicle(access) },
      { label: 'Teléfono', value: access.visitorPhone || 'Sin teléfono' },
      { label: 'Empresa', value: access.companyName || 'Sin empresa' },
      { label: 'Rastreo', value: access.trackingNumber || 'Sin rastreo' },
      {
        label: 'Personas',
        value: access.peopleCount ? String(access.peopleCount) : 'Sin dato',
      },
    ],
    [access],
  );

  const captureCard = useCallback(async () => {
    const target = shotRef.current;

    if (!target) {
      throw new Error('No se pudo generar la imagen del QR.');
    }

    return captureRef(target, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
  }, []);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    setActionError('');

    try {
      const imageUri = await captureCard();
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        throw new Error('El dispositivo no soporta compartir archivos.');
      }

      await Sharing.shareAsync(imageUri, {
        dialogTitle: `Acceso ${access.id}`,
        mimeType: 'image/png',
      });
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'No se pudo compartir la imagen del acceso.',
      );
    } finally {
      setIsSharing(false);
    }
  }, [access.id, captureCard]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setActionError('');

    try {
      const permission = await requestPermissionsAsync(true);

      if (!permission.granted) {
        throw new Error('Debes permitir acceso a fotos para guardar la imagen.');
      }

      const imageUri = await captureCard();
      await Asset.create(imageUri);
      Alert.alert('Imagen guardada', 'El pase se guardó en tu galería.');
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la imagen del acceso.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [captureCard]);

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center self-start rounded-full px-1 py-1"
        onPress={onBack}
      >
        <Ionicons color="#18052E" name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary">Volver</Text>
      </Pressable>

      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary">
          Pase de acceso
        </Text>
        <Text className="font-body text-base text-med-gray">
          Comparte el QR o guarda la imagen para enviarla a tu visitante.
        </Text>
      </View>

      <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
        <Card width="full">
          <View className="gap-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-2">
                <Text className="font-heading text-lg text-primary">
                  {access.visitorName}
                </Text>
                <Text className="font-body text-sm text-med-gray">
                  Folio #{access.id} · {formatVisitType(access.visitType)}
                </Text>
              </View>

              <View className={`rounded-full px-3 py-1 ${statusTone(access.status)}`}>
                <Text className="font-body-semibold text-xs">
                  {formatStatus(access.status)}
                </Text>
              </View>
            </View>

            <View className="items-center rounded-3xl bg-[#F8F7FA] px-4 py-5">
              <QRCode size={220} value={access.qrToken} />
            </View>

            <View className="gap-3 rounded-3xl bg-[#F8F7FA] p-4">
              <Text className="font-heading text-base text-primary">Token QR</Text>
              <Text className="rounded-2xl bg-white px-3 py-3 font-body text-xs leading-5 text-primary">
                {access.qrToken}
              </Text>
            </View>

            <View className="gap-3">
              {detailRows.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-start justify-between gap-4 border-b border-light-gray pb-3"
                >
                  <Text className="font-heading text-sm text-primary">
                    {row.label}
                  </Text>
                  <Text className="flex-1 text-right font-body-semibold text-sm text-primary">
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      </ViewShot>

      {actionError ? (
        <View className="rounded-2xl border border-[#F1A2A2] bg-[#FDECEC] px-4 py-3">
          <Text className="font-body text-sm text-danger">{actionError}</Text>
        </View>
      ) : null}

      <View className="gap-3">
        <Button
          icon="share-social-outline"
          loading={isSharing}
          title="Compartir"
          onPress={() => {
            void handleShare();
          }}
        />
        <Button
          icon="download-outline"
          loading={isSaving}
          title="Guardar imagen"
          variant="secondary"
          onPress={() => {
            void handleSave();
          }}
        />
      </View>
    </View>
  );
}

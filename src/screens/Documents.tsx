import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import { getContentUriAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import { buildApiUrl, getApiAccessToken } from '../services/api';
import { isPdfDocument, listDocuments } from '../services/documents';
import { getErrorMessage } from '../services/error';
import { queryKeys } from '../services/queryKeys';
import type { CondominiumDocumentDto } from '../services/types';
import { useAppThemeColors } from '../theme/tokens';

function localDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (localDateKey(value) === localDateKey(today.toISOString())) return 'Hoy';
  if (localDateKey(value) === localDateKey(yesterday.toISOString())) return 'Ayer';

  return new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension?.replace(/[^a-z0-9]/g, '') || 'bin';
}

export default function Documents() {
  const themeColors = useAppThemeColors();
  const [search, setSearch] = useState('');
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [openError, setOpenError] = useState('');

  const documentsQuery = useQuery({
    queryKey: queryKeys.documents,
    queryFn: listDocuments,
  });

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es-MX');
    if (!normalizedSearch) return documentsQuery.data ?? [];

    return (documentsQuery.data ?? []).filter((document) =>
      document.fileName
        .toLocaleLowerCase('es-MX')
        .includes(normalizedSearch),
    );
  }, [documentsQuery.data, search]);

  const groupedDocuments = useMemo(() => {
    const groups = new Map<string, CondominiumDocumentDto[]>();
    filteredDocuments.forEach((document) => {
      const key = localDateKey(document.createdAt);
      groups.set(key, [...(groups.get(key) ?? []), document]);
    });
    return Array.from(groups.entries());
  }, [filteredDocuments]);

  const openDocument = async (document: CondominiumDocumentDto) => {
    const accessToken = getApiAccessToken();
    if (!accessToken) {
      setOpenError('Tu sesión ya no es válida. Inicia sesión nuevamente.');
      return;
    }
    if (!FileSystem.cacheDirectory) {
      setOpenError('No hay almacenamiento temporal disponible.');
      return;
    }

    setOpeningId(document.id);
    setOpenError('');

    try {
      const localUri = `${FileSystem.cacheDirectory}document-${document.id}-${Date.now()}.${fileExtension(document.fileName)}`;
      const result = await FileSystem.downloadAsync(
        buildApiUrl(document.fileUrl),
        localUri,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (Platform.OS === 'android' && isPdfDocument(document)) {
        const contentUri = await getContentUriAsync(result.uri);
        await Linking.openURL(contentUri);
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          dialogTitle: document.fileName,
          mimeType: document.fileMimeType,
        });
        return;
      }

      await Linking.openURL(result.uri);
    } catch {
      setOpenError(
        isPdfDocument(document)
          ? 'No se pudo abrir el PDF en el dispositivo.'
          : 'No se pudo descargar el documento.',
      );
    } finally {
      setOpeningId(null);
    }
  };

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">
          Documentos
        </Text>
        <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
          Consulta los archivos compartidos por la administración.
        </Text>
      </View>

      <View className="flex-row items-center gap-3 rounded-2xl border border-light-gray bg-white px-4 dark:border-[#3B3345] dark:bg-[#211A29]">
        <Ionicons color={themeColors.textSubtle} name="search-outline" size={20} />
        <TextInput
          accessibilityLabel="Buscar documentos"
          className="min-h-12 flex-1 font-body text-base text-primary dark:text-[#F7F2FB]"
          placeholder="Buscar por nombre..."
          placeholderTextColor={themeColors.textSubtle}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {openError ? (
        <Card className="border border-danger/30 px-4 py-3">
          <Text className="font-body text-sm text-danger">{openError}</Text>
        </Card>
      ) : null}

      {documentsQuery.isLoading ? (
        <Card>
          <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
            Cargando documentos...
          </Text>
        </Card>
      ) : documentsQuery.error ? (
        <Card>
          <Text className="font-body text-sm text-danger">
            {getErrorMessage(
              documentsQuery.error,
              'No fue posible cargar los documentos.',
            )}
          </Text>
        </Card>
      ) : groupedDocuments.length ? (
        groupedDocuments.map(([key, documents]) => (
          <View key={key} className="gap-2">
            <Text className="font-body-semibold text-sm capitalize text-med-gray dark:text-[#B9B2C2]">
              {formatDateLabel(documents[0].createdAt)}
            </Text>

            <Card className="gap-1 rounded-2xl border border-light-gray p-2 dark:border-[#3B3345]">
              {documents.map((document) => {
                const pdf = isPdfDocument(document);
                return (
                  <Pressable
                    key={document.id}
                    accessibilityHint={pdf ? 'Abre el PDF' : 'Descarga el documento'}
                    accessibilityRole="button"
                    className="flex-row items-center gap-3 rounded-xl px-2 py-3"
                    disabled={openingId === document.id}
                    onPress={() => void openDocument(document)}
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F1EDF5] dark:bg-[#18131F]">
                      <Ionicons
                        color={pdf ? '#E2354D' : themeColors.textMuted}
                        name={pdf ? 'document-text-outline' : 'document-outline'}
                        size={23}
                      />
                    </View>

                    <View className="min-w-0 flex-1 gap-1">
                      <Text
                        className="font-body-semibold text-sm text-primary dark:text-[#F7F2FB]"
                        numberOfLines={1}
                      >
                        {document.fileName}
                      </Text>
                      <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                        {formatFileSize(document.fileSize)} · {formatTime(document.createdAt)}
                      </Text>
                    </View>

                    <Button
                      accessibilityLabel={`${pdf ? 'Abrir' : 'Descargar'} ${document.fileName}`}
                      icon={pdf ? 'eye-outline' : 'download-outline'}
                      loading={openingId === document.id}
                      size="sm"
                      title={pdf ? 'Ver' : ''}
                      variant="outline"
                      onPress={() => void openDocument(document)}
                    />
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))
      ) : (
        <Card>
          <View className="items-center gap-2 py-8">
            <Ionicons color={themeColors.textSubtle} name="folder-open-outline" size={38} />
            <Text className="font-heading text-base text-primary dark:text-[#F7F2FB]">
              {search ? 'No encontramos documentos' : 'Aún no hay documentos'}
            </Text>
            <Text className="text-center font-body text-sm text-med-gray dark:text-[#B9B2C2]">
              {search
                ? 'Prueba con otro nombre de archivo.'
                : 'Los archivos del condominio aparecerán aquí.'}
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
}

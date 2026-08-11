import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import {
  Alert,
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
import {
  clearDocumentsDirectoryUri,
  loadDocumentsDirectoryUri,
  storeDocumentsDirectoryUri,
} from '../services/storage';
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

function fileNameWithoutExtension(fileName: string) {
  const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, '_').trim();
  const extensionIndex = safeFileName.lastIndexOf('.');
  return (extensionIndex > 0 ? safeFileName.slice(0, extensionIndex) : safeFileName) || 'documento';
}

async function selectDownloadDirectory() {
  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
    FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download'),
  );

  if (!permissions.granted) return null;

  await storeDocumentsDirectoryUri(permissions.directoryUri);
  return permissions.directoryUri;
}

export default function Documents() {
  const themeColors = useAppThemeColors();
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState('');

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

  const downloadDocument = async (document: CondominiumDocumentDto) => {
    const accessToken = getApiAccessToken();
    if (!accessToken) {
      setDownloadError('Tu sesión ya no es válida. Inicia sesión nuevamente.');
      return;
    }
    if (!FileSystem.cacheDirectory) {
      setDownloadError('No hay almacenamiento disponible en el dispositivo.');
      return;
    }

    setDownloadingId(document.id);
    setDownloadError('');

    let temporaryUri: string | null = null;

    try {
      temporaryUri = `${FileSystem.cacheDirectory}document-${document.id}-${Date.now()}.${fileExtension(document.fileName)}`;
      const result = await FileSystem.downloadAsync(
        buildApiUrl(document.fileUrl),
        temporaryUri,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (result.status < 200 || result.status >= 300) throw new Error('Download failed');

      if (Platform.OS === 'android') {
        let directoryUri = await loadDocumentsDirectoryUri();
        if (!directoryUri) directoryUri = await selectDownloadDirectory();

        if (!directoryUri) {
          setDownloadError('Selecciona una carpeta para guardar el documento.');
          return;
        }

        let savedUri: string;
        try {
          savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri,
            fileNameWithoutExtension(document.fileName),
            document.fileMimeType || 'application/octet-stream',
          );
        } catch {
          await clearDocumentsDirectoryUri();
          const newDirectoryUri = await selectDownloadDirectory();
          if (!newDirectoryUri) {
            setDownloadError('Selecciona una carpeta para guardar el documento.');
            return;
          }
          savedUri = await FileSystem.StorageAccessFramework.createFileAsync(
            newDirectoryUri,
            fileNameWithoutExtension(document.fileName),
            document.fileMimeType || 'application/octet-stream',
          );
        }

        const fileContents = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.writeAsStringAsync(savedUri, fileContents, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(
          'Documento descargado',
          `${document.fileName} se guardó en la carpeta seleccionada.`,
          [{ text: 'Aceptar' }],
        );
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
      setDownloadError('No se pudo descargar el documento.');
    } finally {
      if (temporaryUri) {
        await FileSystem.deleteAsync(temporaryUri, { idempotent: true }).catch(() => undefined);
      }
      setDownloadingId(null);
    }
  };

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">
          Documentos
        </Text>
        <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
          Descarga los archivos compartidos por la administración para verlos en tu teléfono.
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

      {downloadError ? (
        <Card className="border border-danger/30 px-4 py-3">
          <Text className="font-body text-sm text-danger">{downloadError}</Text>
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
                    accessibilityHint="Descarga el documento en el teléfono"
                    accessibilityRole="button"
                    className="flex-row items-center gap-3 rounded-xl px-2 py-3"
                    disabled={downloadingId === document.id}
                    onPress={() => void downloadDocument(document)}
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
                      accessibilityLabel={`Descargar ${document.fileName}`}
                      icon="download-outline"
                      loading={downloadingId === document.id}
                      size="sm"
                      title=""
                      variant="outline"
                      onPress={() => void downloadDocument(document)}
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

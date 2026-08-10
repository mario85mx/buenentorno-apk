import { api } from './api';
import type {
  CondominiumDocumentDto,
  ListDocumentsResponse,
} from './types';

export async function listDocuments() {
  const { data } = await api.get<ListDocumentsResponse>('/documents');
  return data.data;
}

export function isPdfDocument(document: CondominiumDocumentDto) {
  return (
    document.fileMimeType === 'application/pdf' ||
    /\.pdf$/i.test(document.fileName)
  );
}

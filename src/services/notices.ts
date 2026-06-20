import { api } from './api';
import type { ListNoticesResponse, NoticeDto } from './types';

export async function listNotices() {
  const { data } = await api.get<ListNoticesResponse>('/notices');
  return data.data;
}

export async function getNotice(noticeId: number) {
  const { data } = await api.get<NoticeDto>(`/notices/${noticeId}`);
  return data;
}


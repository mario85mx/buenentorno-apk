import { api } from './api';
import type {
  ListSurveysResponse,
  SurveyDto,
  SurveyVotePayload,
} from './types';

export async function listSurveys() {
  const { data } = await api.get<ListSurveysResponse>('/surveys');
  return data.data;
}

export async function getSurvey(surveyId: number) {
  const { data } = await api.get<SurveyDto>(`/surveys/${surveyId}`);
  return data;
}

export async function voteSurvey(
  surveyId: number,
  payload: SurveyVotePayload,
) {
  const { data } = await api.post<SurveyDto>(`/surveys/${surveyId}/vote`, payload);
  return data;
}

export async function removeSurveyVote(surveyId: number) {
  const { data } = await api.delete<SurveyDto>(`/surveys/${surveyId}/vote`);
  return data;
}

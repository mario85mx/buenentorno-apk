import { useAppThemeColors } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';
import { getErrorMessage } from '../services/error';
import { formatDateTime } from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import { getSurvey, removeSurveyVote, voteSurvey } from '../services/surveys';
import type { SurveyDto } from '../services/types';

interface EncuestaDetailProps {
  surveyId: number;
  canViewVoterHouses?: boolean;
  onBack?: () => void;
}

function replaceSurvey(
  current: SurveyDto[] | undefined,
  survey: SurveyDto,
) {
  if (!current) {
    return current;
  }

  return current.map((item) => (item.id === survey.id ? survey : item));
}

function surveyStatusVariant(isOpen: boolean) {
  return isOpen ? 'success' : 'neutral';
}

export default function EncuestaDetail({
  surveyId,
  canViewVoterHouses = false,
  onBack,
}: EncuestaDetailProps) {
  const themeColors = useAppThemeColors();
  const queryClient = useQueryClient();
  const surveyQuery = useQuery({
    queryKey: queryKeys.surveyDetail(surveyId),
    queryFn: () => getSurvey(surveyId),
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: number) => voteSurvey(surveyId, { optionId }),
    onSuccess: (survey) => {
      queryClient.setQueryData(queryKeys.surveyDetail(surveyId), survey);
      queryClient.setQueryData<SurveyDto[] | undefined>(
        queryKeys.surveys,
        (current) => replaceSurvey(current, survey),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.surveys });
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: () => removeSurveyVote(surveyId),
    onSuccess: (survey) => {
      queryClient.setQueryData(queryKeys.surveyDetail(surveyId), survey);
      queryClient.setQueryData<SurveyDto[] | undefined>(
        queryKeys.surveys,
        (current) => replaceSurvey(current, survey),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.surveys });
    },
  });

  const survey = surveyQuery.data;
  const isSubmitting = voteMutation.isPending || removeVoteMutation.isPending;

  return (
    <View className="gap-5">
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center self-start rounded-full px-1 py-1"
        onPress={onBack}
      >
        <Ionicons color={themeColors.text} name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary dark:text-[#F7F2FB]">Volver</Text>
      </Pressable>

      {surveyQuery.isLoading ? (
        <Card width="full">
          <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
            Cargando encuesta...
          </Text>
        </Card>
      ) : surveyQuery.error ? (
        <Card width="full">
          <Text className="font-body text-sm text-danger">
            {getErrorMessage(
              surveyQuery.error,
              'No fue posible cargar la encuesta.',
            )}
          </Text>
        </Card>
      ) : !survey ? (
        <Card width="full">
          <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
            No se encontró la encuesta solicitada.
          </Text>
        </Card>
      ) : (
        <Card width="full">
          <View className="gap-5">
            <View className="gap-3">
              <View className="flex-row flex-wrap items-center gap-2">
                <Badge
                  label={survey.isOpen ? 'Abierta' : 'Cerrada'}
                  variant={surveyStatusVariant(survey.isOpen)}
                />
                {survey.myOptionId ? (
                  <Badge label="Ya votaste" variant="accent" />
                ) : null}
              </View>

              <Text className="font-heading text-2xl leading-8 text-primary dark:text-[#F7F2FB]">
                {survey.title}
              </Text>

              <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
                {survey.description?.trim() || 'Sin descripción adicional.'}
              </Text>
            </View>

            <View className="gap-2 rounded-2xl bg-[#F8F7FA] dark:bg-[#18131F] p-4">
              <Text className="font-body text-sm text-primary dark:text-[#F7F2FB]">
                Publicada: {formatDateTime(survey.publishedAt)}
              </Text>
              <Text className="font-body text-sm text-primary dark:text-[#F7F2FB]">
                Cierre: {formatDateTime(survey.closesAt)}
              </Text>
              <Text className="font-body text-sm text-primary dark:text-[#F7F2FB]">
                Total de votos: {survey.totalVotes}
              </Text>
            </View>

            <View className="gap-3">
              {survey.options.map((option) => {
                const isSelected = option.id === survey.myOptionId;

                return (
                  <Card
                    key={option.id}
                    className={`rounded-2xl border px-4 py-4 ${
                      isSelected ? 'border-secondary bg-[#F7EEF5] dark:bg-[#3A2938]' : 'border-light-gray dark:border-[#3B3345]'
                    }`}
                    width="full"
                  >
                    <View className="gap-3">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 gap-1">
                          <Text className="font-body-semibold text-base text-primary dark:text-[#F7F2FB]">
                            {option.text}
                          </Text>
                          <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                            {option.voteCount} voto{option.voteCount === 1 ? '' : 's'}
                          </Text>

                          {canViewVoterHouses && option.voterHouseNumbers ? (
                            <View className="mt-3 gap-2">
                              <View className="flex-row items-center gap-1.5">
                                <Ionicons
                                  color={themeColors.textMuted}
                                  name="home-outline"
                                  size={14}
                                />
                                <Text className="font-body-semibold text-[11px] uppercase tracking-wide text-med-gray dark:text-[#B9B2C2]">
                                  Casas que votaron
                                </Text>
                              </View>

                              {option.voterHouseNumbers.length > 0 ? (
                                <View className="flex-row flex-wrap gap-1.5">
                                  {option.voterHouseNumbers.map((houseNumber) => (
                                    <View
                                      key={houseNumber}
                                      className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                      <Text className="font-body-semibold text-xs text-slate-700 dark:text-slate-200">
                                        Casa {houseNumber}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              ) : (
                                <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                                  Ninguna casa ha votado por esta opción.
                                </Text>
                              )}
                            </View>
                          ) : null}
                        </View>

                        {isSelected ? (
                          <Badge label="Seleccionada" variant="accent" />
                        ) : null}
                      </View>

                      <Button
                        title={isSelected ? 'Cambiar voto' : 'Votar por esta opción'}
                        variant={isSelected ? 'secondary' : 'outline'}
                        onPress={() => voteMutation.mutate(option.id)}
                        disabled={!survey.isOpen || isSubmitting}
                        loading={voteMutation.isPending}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>

            {survey.myOptionId ? (
              <Button
                title="Retirar voto"
                variant="outline"
                onPress={() => removeVoteMutation.mutate()}
                disabled={!survey.isOpen || isSubmitting}
                loading={removeVoteMutation.isPending}
              />
            ) : null}
          </View>
        </Card>
      )}
    </View>
  );
}

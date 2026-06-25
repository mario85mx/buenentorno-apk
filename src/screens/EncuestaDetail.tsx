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
  onBack,
}: EncuestaDetailProps) {
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
        <Ionicons color="#18052E" name="chevron-back" size={20} />
        <Text className="font-heading text-sm text-primary">Volver</Text>
      </Pressable>

      {surveyQuery.isLoading ? (
        <Card width="full">
          <Text className="font-body text-sm text-med-gray">
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
          <Text className="font-body text-base text-med-gray">
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

              <Text className="font-heading text-2xl leading-8 text-primary">
                {survey.title}
              </Text>

              <Text className="font-body text-base text-med-gray">
                {survey.description?.trim() || 'Sin descripción adicional.'}
              </Text>
            </View>

            <View className="gap-2 rounded-2xl bg-[#F8F7FA] p-4">
              <Text className="font-body text-sm text-primary">
                Publicada: {formatDateTime(survey.publishedAt)}
              </Text>
              <Text className="font-body text-sm text-primary">
                Cierre: {formatDateTime(survey.closesAt)}
              </Text>
              <Text className="font-body text-sm text-primary">
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
                      isSelected ? 'border-secondary bg-[#F7EEF5]' : 'border-light-gray'
                    }`}
                    width="full"
                  >
                    <View className="gap-3">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 gap-1">
                          <Text className="font-body-semibold text-base text-primary">
                            {option.text}
                          </Text>
                          <Text className="font-body text-xs text-med-gray">
                            {option.voteCount} voto{option.voteCount === 1 ? '' : 's'}
                          </Text>
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

import { useAppThemeColors } from '../theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Pressable, Text, View } from 'react-native';
import Badge from '../components/atoms/Badge';
import Card from '../components/atoms/Card';
import { getErrorMessage } from '../services/error';
import { formatDateTime } from '../services/mappers';
import { queryKeys } from '../services/queryKeys';
import { listSurveys } from '../services/surveys';

interface EncuestasProps {
  onOpenSurveyDetail?: (surveyId: number) => void;
}

function surveyStatusVariant(isOpen: boolean) {
  return isOpen ? 'success' : 'neutral';
}

export default function Encuestas({ onOpenSurveyDetail }: EncuestasProps) {
  const themeColors = useAppThemeColors();
  const surveysQuery = useQuery({
    queryKey: queryKeys.surveys,
    queryFn: listSurveys,
  });

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="font-heading text-2xl text-primary dark:text-[#F7F2FB]">Encuestas</Text>
        <Text className="font-body text-base text-med-gray dark:text-[#B9B2C2]">
          Participa en decisiones y consultas activas del condominio.
        </Text>
      </View>

      <View className="gap-3">
        {surveysQuery.isLoading ? (
          <Card width="full">
            <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
              Cargando encuestas...
            </Text>
          </Card>
        ) : surveysQuery.error ? (
          <Card width="full">
            <Text className="font-body text-sm text-danger">
              {getErrorMessage(
                surveysQuery.error,
                'No fue posible cargar las encuestas.',
              )}
            </Text>
          </Card>
        ) : surveysQuery.data?.length ? (
          surveysQuery.data.map((survey) => (
            <Pressable
              key={survey.id}
              accessibilityHint="Abre el detalle de la encuesta"
              accessibilityRole="button"
              className="rounded-lg"
              onPress={() => onOpenSurveyDetail?.(survey.id)}
            >
              <Card className="rounded-lg border border-light-gray dark:border-[#3B3345] px-4 py-4">
                <View className="gap-3">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-2">
                      <Badge
                        className="self-start"
                        label={survey.isOpen ? 'Abierta' : 'Cerrada'}
                        variant={surveyStatusVariant(survey.isOpen)}
                      />
                      <Text className="font-heading text-lg text-primary dark:text-[#F7F2FB]">
                        {survey.title}
                      </Text>
                    </View>

                    <Ionicons
                      color={themeColors.textSubtle}
                      name="chevron-forward"
                      size={18}
                    />
                  </View>

                  <Text className="font-body text-sm leading-6 text-primary dark:text-[#F7F2FB]">
                    {survey.description?.trim() || 'Sin descripción adicional.'}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                      {survey.totalVotes} voto{survey.totalVotes === 1 ? '' : 's'}
                    </Text>
                    {survey.myOptionId ? (
                      <Badge label="Ya votaste" variant="accent" />
                    ) : null}
                  </View>

                  <Text className="font-body text-xs text-med-gray dark:text-[#B9B2C2]">
                    Publicada: {formatDateTime(survey.publishedAt)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        ) : (
          <Card width="full">
            <Text className="font-body text-sm text-med-gray dark:text-[#B9B2C2]">
              No hay encuestas publicadas todavía.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}

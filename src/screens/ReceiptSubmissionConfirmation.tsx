import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Button from '../components/atoms/Button';
import Card from '../components/atoms/Card';

interface ReceiptSubmissionConfirmationProps {
  onBackHome?: () => void;
  onUploadAnother?: () => void;
}

export default function ReceiptSubmissionConfirmation({
  onBackHome,
  onUploadAnother,
}: ReceiptSubmissionConfirmationProps) {
  return (
    <View className="gap-5">
      <View className="items-center gap-3 pt-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <Ionicons color="#83A96A" name="checkmark" size={32} />
        </View>

        <View className="items-center gap-2">
          <Text className="font-heading text-2xl text-primary">
            Comprobante enviado
          </Text>
          <Text className="px-4 text-center font-body text-base text-med-gray">
            Tu comprobante fue enviado correctamente a revisión. Te avisaremos
            cuando el pago haya sido validado.
          </Text>
        </View>
      </View>

      <Card width="full">
        <View className="gap-3">
          <Text className="font-heading text-lg text-primary">
            Siguiente paso
          </Text>
          <Text className="font-body text-base text-med-gray">
            El equipo administrativo revisará la referencia, la clave de rastreo
            y el archivo adjunto antes de aplicar el pago.
          </Text>
        </View>
      </Card>

      <View className="gap-3">
        <Button title="Volver al inicio" onPress={onBackHome} />
        <Button
          title="Subir otro comprobante"
          variant="secondary"
          onPress={onUploadAnother}
        />
      </View>
    </View>
  );
}

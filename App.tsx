import './global.css';
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
} from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Fragment } from 'react';
import { Text, View } from 'react-native';
import Button from './src/components/atoms/Button';
import Layout from './src/components/organisms/Layout';

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Fragment>
      <Layout>
        <View className="gap-4">
          <View className="rounded-3xl bg-primary p-6">
            <Text className="font-heading text-3xl text-white">
              Bienvenido a Buen Entorno
            </Text>
            <Text className="mt-2 font-body text-body text-[#D8CEE4]">
              El layout principal ya incluye header, sidebar y navbar.
            </Text>
            <Button
              className="mt-5 self-start border-white bg-accent"
              title="Continuar"
              onPress={() => console.log('tap')}
            />
          </View>

          <View className="gap-4 md:flex-row">
            <View className="rounded-3xl border border-light-gray bg-white p-5 md:flex-1">
              <Text className="font-heading text-xl text-primary">
                Entornos activos
              </Text>
              <Text className="mt-2 font-body text-body text-med-gray">
                12 espacios supervisados con estado estable.
              </Text>
            </View>

            <View className="rounded-3xl border border-light-gray bg-white p-5 md:flex-1">
              <Text className="font-heading text-xl text-primary">
                Alertas recientes
              </Text>
              <Text className="mt-2 font-body text-body text-med-gray">
                3 incidencias pendientes de revision.
              </Text>
            </View>
          </View>
        </View>
      </Layout>
      <StatusBar style="dark" />
    </Fragment>
  );
}

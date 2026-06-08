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
import Layout from './src/components/organisms/Layout';
import Account from './src/screens/Account';

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
        <Account />
      </Layout>
      <StatusBar style="dark" />
    </Fragment>
  );
}

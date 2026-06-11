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
import { Fragment, useMemo, useState } from 'react';
import Layout from './src/components/organisms/Layout';
import Account from './src/screens/Account';
import Home from './src/screens/Home';
import Notifications from './src/screens/Notifications';
import PaymentReceiptDetail from './src/screens/PaymentReceiptDetail';
import PaymentTransactionDetail from './src/screens/PaymentTransactionDetail';
import ReceiptSubmissionConfirmation from './src/screens/ReceiptSubmissionConfirmation';
import UploadReceipt from './src/screens/UploadReceipt';
import type { PaymentReceipt } from './src/screens/PaymentReceiptDetail';
import type { PaymentTransaction } from './src/screens/PaymentTransactionDetail';

type ScreenKey =
  | 'home'
  | 'account'
  | 'payment-transaction-detail'
  | 'payment-receipt-detail'
  | 'upload-receipt'
  | 'receipt-submission-confirmation'
  | 'notifications';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(
    null,
  );
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
  });

  const screen = useMemo(() => {
    if (activeScreen === 'notifications') {
      return <Notifications onBack={() => setActiveScreen('home')} />;
    }

    if (activeScreen === 'receipt-submission-confirmation') {
      return (
        <ReceiptSubmissionConfirmation
          onBackHome={() => setActiveScreen('home')}
          onUploadAnother={() => setActiveScreen('upload-receipt')}
        />
      );
    }

    if (activeScreen === 'upload-receipt') {
      return (
        <UploadReceipt
          onBack={() => setActiveScreen('home')}
          onSubmit={() => setActiveScreen('receipt-submission-confirmation')}
        />
      );
    }

    if (activeScreen === 'payment-receipt-detail') {
      return (
        <PaymentReceiptDetail
          receipt={selectedReceipt}
          onBack={() => setActiveScreen('home')}
        />
      );
    }

    if (activeScreen === 'payment-transaction-detail') {
      return (
        <PaymentTransactionDetail
          transaction={selectedTransaction}
          onBack={() => setActiveScreen('home')}
        />
      );
    }

    if (activeScreen === 'account') {
      return <Account />;
    }

    return (
      <Home
        onOpenPaymentTransactionDetail={(transaction) => {
          setSelectedTransaction(transaction);
          setActiveScreen('payment-transaction-detail')
        }}
        onOpenPaymentReceiptDetail={(receipt) => {
          setSelectedReceipt(receipt);
          setActiveScreen('payment-receipt-detail');
        }}
        onOpenUploadReceipt={() => setActiveScreen('upload-receipt')}
      />
    );
  }, [activeScreen, selectedReceipt, selectedTransaction]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Fragment>
      <Layout
        onHomePress={() => setActiveScreen('home')}
        onNotificationsPress={() => setActiveScreen('notifications')}
        onProfilePress={() => setActiveScreen('account')}
      >
        {screen}
      </Layout>
      <StatusBar style="dark" />
    </Fragment>
  );
}

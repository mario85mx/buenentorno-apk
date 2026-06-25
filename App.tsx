import './global.css';
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
} from '@expo-google-fonts/nunito-sans';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Layout from './src/components/organisms/Layout';
import Account from './src/screens/Account';
import AvisoDetail from './src/screens/AvisoDetail';
import Avisos from './src/screens/Avisos';
import CommonAreas from './src/screens/CommonAreas';
import EncuestaDetail from './src/screens/EncuestaDetail';
import Encuestas from './src/screens/Encuestas';
import Home from './src/screens/Home';
import Login from './src/screens/Login';
import NewTicket from './src/screens/NewTicket';
import Notifications from './src/screens/Notifications';
import PaymentReceiptDetail from './src/screens/PaymentReceiptDetail';
import PaymentTransactionDetail from './src/screens/PaymentTransactionDetail';
import Recovery from './src/screens/Recovery';
import ReceiptSubmissionConfirmation from './src/screens/ReceiptSubmissionConfirmation';
import TicketDetail from './src/screens/TicketDetail';
import Tickets from './src/screens/Tickets';
import UploadReceipt from './src/screens/UploadReceipt';
import { setApiAccessToken } from './src/services/api';
import { forgotPassword, getMe, login } from './src/services/auth';
import { getCommonAreas } from './src/services/commonAreas';
import { getNotifications } from './src/services/condomino';
import { isUnauthorizedError } from './src/services/error';
import {
  mapNoticeDtoToViewModel,
} from './src/services/mappers';
import { getNotice } from './src/services/notices';
import { queryKeys } from './src/services/queryKeys';
import {
  clearStoredSession,
  loadNotificationSeenAt,
  loadStoredSession,
  storeNotificationSeenAt,
  storeSession,
} from './src/services/storage';
import type { AuthResponse, LoginPayload } from './src/services/types';
import type {
  Notice,
  NotificationViewModel,
  PaymentReceipt,
  PaymentTransaction,
} from './src/services/viewModels';

type RootRouteName =
  | 'home'
  | 'common-areas'
  | 'account'
  | 'notifications'
  | 'avisos'
  | 'encuestas'
  | 'tickets';

type AppStackParamList = {
  home: { tab?: 'movimientos' | 'comprobantes' } | undefined;
  'common-areas': undefined;
  account: undefined;
  notifications: undefined;
  avisos: undefined;
  encuestas: undefined;
  tickets: undefined;
  'payment-transaction-detail': { transaction: PaymentTransaction };
  'payment-receipt-detail': { receipt: PaymentReceipt };
  'upload-receipt': undefined;
  'receipt-submission-confirmation': undefined;
  'aviso-detail': { notice: Notice };
  'encuesta-detail': { surveyId: number };
  'ticket-detail': { ticketId: string };
  'new-ticket': undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

function getActiveMenuKey(routeName: RootRouteName) {
  if (routeName === 'common-areas') {
    return 'areas-comunes';
  }

  if (routeName === 'avisos') {
    return 'avisos';
  }

  if (routeName === 'encuestas') {
    return 'encuestas';
  }

  if (routeName === 'tickets') {
    return 'tickets';
  }

  return 'inicio';
}

function AppShell() {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'recovery'>('login');
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [notificationsSeenAt, setNotificationsSeenAt] = useState<string | null>(null);
  const [isHomeRefreshing, setIsHomeRefreshing] = useState(false);
  const isAuthenticated = !!session?.accessToken;
  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    setApiAccessToken(null);
    setSession(null);
    await clearStoredSession();
  }, []);

  useEffect(() => {
    let isMounted = true;

    void loadStoredSession()
      .then((storedSession) => {
        if (!isMounted) {
          return;
        }

        setSession(storedSession);
        setApiAccessToken(storedSession?.accessToken ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setIsSessionReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const meQuery = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: isSessionReady && isAuthenticated,
    retry: false,
  });

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    enabled: isSessionReady && isAuthenticated,
    staleTime: 30_000,
  });
  const commonAreasQuery = useQuery({
    queryKey: queryKeys.commonAreas,
    queryFn: getCommonAreas,
    enabled: isSessionReady && isAuthenticated,
    staleTime: 60_000,
  });
  const shouldShowCommonAreasMenu = useMemo(() => {
    if (!isAuthenticated) {
      return false;
    }

    if (commonAreasQuery.isSuccess) {
      return (commonAreasQuery.data?.length ?? 0) > 0;
    }

    return true;
  }, [commonAreasQuery.data?.length, commonAreasQuery.isSuccess, isAuthenticated]);

  useEffect(() => {
    if (!meQuery.data || !session) {
      return;
    }

    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const sameUser =
        JSON.stringify(currentSession.user) === JSON.stringify(meQuery.data);

      if (sameUser) {
        return currentSession;
      }

      const nextSession = { ...currentSession, user: meQuery.data };
      void storeSession(nextSession);
      return nextSession;
    });
  }, [meQuery.data, session?.accessToken]);

  useEffect(() => {
    if (meQuery.error && isUnauthorizedError(meQuery.error)) {
      void handleLogout();
      setAuthScreen('login');
    }
  }, [handleLogout, meQuery.error]);

  useEffect(() => {
    const userId = session?.user.id;

    if (!userId) {
      setNotificationsSeenAt(null);
      return;
    }

    void loadNotificationSeenAt(userId).then((seenAt) => {
      setNotificationsSeenAt(seenAt);
    });
  }, [session?.user.id]);

  const unreadNotificationsCount = useMemo(() => {
    const notifications = notificationsQuery.data ?? [];

    if (!notifications.length) {
      return 0;
    }

    if (!notificationsSeenAt) {
      return notifications.length;
    }

    const seenAtTime = new Date(notificationsSeenAt).getTime();

    if (Number.isNaN(seenAtTime)) {
      return notifications.length;
    }

    return notifications.filter((notification) => {
      const createdAtTime = new Date(notification.createdAt).getTime();

      if (Number.isNaN(createdAtTime)) {
        return true;
      }

      return createdAtTime > seenAtTime;
    }).length;
  }, [notificationsQuery.data, notificationsSeenAt]);

  const markNotificationsAsSeen = useCallback(async () => {
    const userId = session?.user.id;
    const notifications = notificationsQuery.data;

    if (!userId || !notifications?.length) {
      return;
    }

    const latestCreatedAt = notifications.reduce((latest, notification) =>
      notification.createdAt > latest ? notification.createdAt : latest,
    notifications[0].createdAt);

    setNotificationsSeenAt(latestCreatedAt);
    await storeNotificationSeenAt(userId, latestCreatedAt);
  }, [notificationsQuery.data, session?.user.id]);

  const openHomeTab = useCallback(
    (
      navigation: NativeStackNavigationProp<AppStackParamList>,
      tab: 'movimientos' | 'comprobantes',
    ) => {
      navigation.replace('home', { tab });
    },
    [],
  );

  const handleOpenNotification = useCallback(
    async (
      navigation: NativeStackNavigationProp<AppStackParamList>,
      notification: NotificationViewModel,
    ) => {
      await markNotificationsAsSeen();

      if (notification.type === 'NOTICE') {
        const hrefMatch = notification.href?.match(/\/avisos\/(\d+)/);

        if (hrefMatch) {
          const noticeId = Number(hrefMatch[1]);

          if (!Number.isNaN(noticeId)) {
            try {
              const notice = await getNotice(noticeId);
              navigation.navigate('aviso-detail', {
                notice: mapNoticeDtoToViewModel(notice),
              });
              return;
            } catch {
              navigation.replace('avisos');
              return;
            }
          }
        }

        navigation.replace('avisos');
        return;
      }

      if (notification.type === 'NEW_CHARGE') {
        openHomeTab(navigation, 'movimientos');
        return;
      }

      if (
        notification.type === 'PAYMENT_APPROVED' ||
        notification.type === 'PAYMENT_REJECTED' ||
        notification.type === 'PAYMENT_REVIEW'
      ) {
        openHomeTab(navigation, 'comprobantes');
        return;
      }

      if (notification.href?.startsWith('/areas-comunes')) {
        navigation.replace('common-areas');
        return;
      }

      if (
        notification.href?.startsWith('/encuestas') ||
        notification.href?.startsWith('/surveys')
      ) {
        navigation.replace('encuestas');
        return;
      }

      if (notification.href?.startsWith('/tickets')) {
        navigation.replace('tickets');
        return;
      }

      navigation.replace('home');
    },
    [markNotificationsAsSeen, openHomeTab],
  );

  const handleLogin = useCallback(async (credentials: LoginPayload) => {
    const nextSession = await login(credentials);
    setApiAccessToken(nextSession.accessToken);
    setSession(nextSession);
    await storeSession(nextSession);
  }, []);

  const handleHomeRefresh = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setIsHomeRefreshing(true);

    try {
      await Promise.all([
        queryClient.refetchQueries({
          queryKey: queryKeys.condominiumDetail,
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.dashboardSummary,
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.notifications,
          exact: true,
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.me,
          exact: true,
        }),
      ]);
    } finally {
      setIsHomeRefreshing(false);
    }
  }, [isAuthenticated, queryClient]);

  const handleForgotPassword = useCallback(async (email: string) => {
    return forgotPassword({ email });
  }, []);

  const renderLayout = useCallback(
    (
      navigation: NativeStackNavigationProp<AppStackParamList>,
      routeName: RootRouteName,
      contentKey: string,
      content: React.ReactNode,
      options?: Pick<React.ComponentProps<typeof Layout>, 'onRefresh' | 'refreshing'>,
    ) => {
      const activeMenuKey = getActiveMenuKey(routeName);

      const replaceRoot = (target: RootRouteName) => {
        if (routeName === target) {
          return;
        }

        navigation.replace(target);
      };

      return (
        <Layout
          activeNavbarItemKey={activeMenuKey}
          activeSidebarItemKey={activeMenuKey}
          contentKey={contentKey}
          hasNotifications={unreadNotificationsCount > 0}
          notificationCount={unreadNotificationsCount}
          onAvisosPress={() => replaceRoot('avisos')}
          onCommonAreasPress={() => replaceRoot('common-areas')}
          onHomePress={() => replaceRoot('home')}
          onNotificationsPress={() => {
            void markNotificationsAsSeen();
            replaceRoot('notifications');
          }}
          onLogout={() => {
            void handleLogout();
            setAuthScreen('login');
          }}
          onProfilePress={() => replaceRoot('account')}
          onSurveysPress={() => replaceRoot('encuestas')}
          onTicketsPress={() => replaceRoot('tickets')}
          onRefresh={options?.onRefresh}
          refreshing={options?.refreshing}
          showCommonAreasMenu={shouldShowCommonAreasMenu}
        >
          {content}
        </Layout>
      );
    },
    [
      handleLogout,
      markNotificationsAsSeen,
      shouldShowCommonAreasMenu,
      unreadNotificationsCount,
    ],
  );

  const authContent = useMemo(
    () =>
      authScreen === 'recovery' ? (
        <Recovery
          onBack={() => setAuthScreen('login')}
          onSubmit={handleForgotPassword}
        />
      ) : (
        <Login
          onLogin={handleLogin}
          onOpenRecovery={() => setAuthScreen('recovery')}
        />
      ),
    [authScreen, handleForgotPassword, handleLogin],
  );

  if (!isSessionReady) {
    return null;
  }

  if (meQuery.error && !isUnauthorizedError(meQuery.error)) {
    return authContent;
  }

  return (
    <>
      {isAuthenticated ? (
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="home"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F6F3FA' },
              freezeOnBlur: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="home">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'home',
                  route.key,
                  <Home
                    initialTab={route.params?.tab}
                    onOpenPaymentTransactionDetail={(transaction) =>
                      navigation.navigate('payment-transaction-detail', {
                        transaction,
                      })
                    }
                    onOpenPaymentReceiptDetail={(receipt) =>
                      navigation.navigate('payment-receipt-detail', {
                        receipt,
                      })
                    }
                    onOpenUploadReceipt={() =>
                      navigation.navigate('upload-receipt')
                    }
                  />,
                  {
                    onRefresh: () => {
                      void handleHomeRefresh();
                    },
                    refreshing: isHomeRefreshing,
                  },
                )
              }
            </Stack.Screen>

            <Stack.Screen name="account">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'account',
                  route.key,
                  <Account
                    onLogout={() => {
                      void handleLogout();
                      setAuthScreen('login');
                    }}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen name="common-areas">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'common-areas',
                  route.key,
                  <CommonAreas />,
                )
              }
            </Stack.Screen>

            <Stack.Screen name="notifications">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'notifications',
                  route.key,
                  <Notifications
                    onBack={() => navigation.replace('home')}
                    onMarkAsSeen={() => {
                      void markNotificationsAsSeen();
                    }}
                    onOpenNotification={(notification) => {
                      void handleOpenNotification(navigation, notification);
                    }}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen name="avisos">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'avisos',
                  route.key,
                  <Avisos
                    onOpenNoticeDetail={(notice) =>
                      navigation.navigate('aviso-detail', { notice })
                    }
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen name="encuestas">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'encuestas',
                  route.key,
                  <Encuestas
                    onOpenSurveyDetail={(surveyId) =>
                      navigation.navigate('encuesta-detail', { surveyId })
                    }
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen name="tickets">
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'tickets',
                  route.key,
                  <Tickets
                    onOpenNewTicket={() => navigation.navigate('new-ticket')}
                    onOpenTicketDetail={(ticket) =>
                      navigation.navigate('ticket-detail', {
                        ticketId: ticket.id,
                      })
                    }
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="payment-transaction-detail"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'home',
                  route.key,
                  <PaymentTransactionDetail
                    transaction={route.params.transaction}
                    onBack={() => navigation.goBack()}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="payment-receipt-detail"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'home',
                  route.key,
                  <PaymentReceiptDetail
                    receipt={route.params.receipt}
                    onBack={() => navigation.goBack()}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="upload-receipt"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'home',
                  route.key,
                  <UploadReceipt
                    onBack={() => navigation.goBack()}
                    onSubmitSuccess={() =>
                      navigation.replace('receipt-submission-confirmation')
                    }
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="receipt-submission-confirmation"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'home',
                  route.key,
                  <ReceiptSubmissionConfirmation
                    onBackHome={() => navigation.replace('home')}
                    onUploadAnother={() =>
                      navigation.replace('upload-receipt')
                    }
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="aviso-detail"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'avisos',
                  route.key,
                  <AvisoDetail
                    notice={route.params.notice}
                    onBack={() => navigation.goBack()}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="encuesta-detail"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'encuestas',
                  route.key,
                  <EncuestaDetail
                    surveyId={route.params.surveyId}
                    onBack={() => navigation.goBack()}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="ticket-detail"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'tickets',
                  route.key,
                  <TicketDetail
                    ticketId={route.params.ticketId}
                    onBack={() => navigation.goBack()}
                  />,
                )
              }
            </Stack.Screen>

            <Stack.Screen
              name="new-ticket"
              options={{ animation: 'slide_from_right' }}
            >
              {({ navigation, route }) =>
                renderLayout(
                  navigation,
                  'tickets',
                  route.key,
                  <NewTicket
                    onBack={() => navigation.goBack()}
                    onCreated={(ticketId) => {
                      navigation.replace('ticket-detail', { ticketId });
                    }}
                  />,
                )
              }
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        authContent
      )}
      <StatusBar style={isAuthenticated ? 'dark' : 'light'} />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
  });
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: false,
          },
        },
      }),
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppShell />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Layout from './src/components/organisms/Layout';
import Account from './src/screens/Account';
import AvisoDetail from './src/screens/AvisoDetail';
import Avisos from './src/screens/Avisos';
import Home from './src/screens/Home';
import NewTicket from './src/screens/NewTicket';
import Notifications from './src/screens/Notifications';
import PaymentReceiptDetail from './src/screens/PaymentReceiptDetail';
import PaymentTransactionDetail from './src/screens/PaymentTransactionDetail';
import ReceiptSubmissionConfirmation from './src/screens/ReceiptSubmissionConfirmation';
import TicketDetail from './src/screens/TicketDetail';
import Tickets from './src/screens/Tickets';
import UploadReceipt from './src/screens/UploadReceipt';
import type { Notice } from './src/screens/Avisos';
import type { PaymentReceipt } from './src/screens/PaymentReceiptDetail';
import type { PaymentTransaction } from './src/screens/PaymentTransactionDetail';
import {
  initialTickets,
  type NewTicketPayload,
  type Ticket,
  type TicketStatus,
} from './src/screens/ticketsData';

type ScreenKey =
  | 'home'
  | 'account'
  | 'payment-transaction-detail'
  | 'payment-receipt-detail'
  | 'upload-receipt'
  | 'receipt-submission-confirmation'
  | 'notifications'
  | 'avisos'
  | 'aviso-detail'
  | 'tickets'
  | 'ticket-detail'
  | 'new-ticket';

function formatTicketTimestamp() {
  const date = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('home');
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(
    null,
  );
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
  });
  const selectedTicket =
    tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;

  const handleCreateTicket = (payload: NewTicketPayload) => {
    const timestamp = formatTicketTimestamp();
    const ticketId = `ticket-${Date.now()}`;
    const nextTicket: Ticket = {
      id: ticketId,
      subject: payload.subject,
      house: payload.house,
      category: payload.category,
      priority: payload.priority,
      status: 'Abierto',
      assignedTo: 'Sin asignar',
      lastActivity: timestamp,
      messages: [
        {
          id: `${ticketId}-message-1`,
          author: 'Residente',
          body: payload.initialMessage,
          timestamp,
          isResident: true,
        },
      ],
    };

    setTickets((currentTickets) => [nextTicket, ...currentTickets]);
    setSelectedTicketId(ticketId);
    setActiveScreen('ticket-detail');
  };

  const handleAddTicketMessage = (ticketId: string, message: string) => {
    const timestamp = formatTicketTimestamp();

    setTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        return {
          ...ticket,
          lastActivity: timestamp,
          messages: [
            ...ticket.messages,
            {
              id: `${ticketId}-message-${ticket.messages.length + 1}`,
              author: 'Residente',
              body: message,
              timestamp,
              isResident: true,
            },
          ],
        };
      }),
    );
  };

  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    const timestamp = formatTicketTimestamp();

    setTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId) {
          return ticket;
        }

        return {
          ...ticket,
          status,
          lastActivity: timestamp,
        };
      }),
    );
  };

  const screen = useMemo(() => {
    if (activeScreen === 'notifications') {
      return <Notifications onBack={() => setActiveScreen('home')} />;
    }

    if (activeScreen === 'new-ticket') {
      return (
        <NewTicket
          onBack={() => setActiveScreen('tickets')}
          onSubmit={handleCreateTicket}
        />
      );
    }

    if (activeScreen === 'ticket-detail') {
      return (
        <TicketDetail
          ticket={selectedTicket}
          onBack={() => setActiveScreen('tickets')}
          onAddMessage={handleAddTicketMessage}
          onUpdateStatus={handleUpdateTicketStatus}
        />
      );
    }

    if (activeScreen === 'tickets') {
      return (
        <Tickets
          tickets={tickets}
          onOpenNewTicket={() => setActiveScreen('new-ticket')}
          onOpenTicketDetail={(ticket) => {
            setSelectedTicketId(ticket.id);
            setActiveScreen('ticket-detail');
          }}
        />
      );
    }

    if (activeScreen === 'aviso-detail') {
      return (
        <AvisoDetail
          notice={selectedNotice}
          onBack={() => setActiveScreen('avisos')}
        />
      );
    }

    if (activeScreen === 'avisos') {
      return (
        <Avisos
          onOpenNoticeDetail={(notice) => {
            setSelectedNotice(notice);
            setActiveScreen('aviso-detail');
          }}
        />
      );
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
          setActiveScreen('payment-transaction-detail');
        }}
        onOpenPaymentReceiptDetail={(receipt) => {
          setSelectedReceipt(receipt);
          setActiveScreen('payment-receipt-detail');
        }}
        onOpenUploadReceipt={() => setActiveScreen('upload-receipt')}
      />
    );
  }, [
    activeScreen,
    selectedNotice,
    selectedReceipt,
    selectedTicket,
    selectedTransaction,
    tickets,
  ]);

  const activeSidebarItemKey =
    activeScreen === 'tickets' ||
    activeScreen === 'ticket-detail' ||
    activeScreen === 'new-ticket'
      ? 'tickets'
      : activeScreen === 'avisos' || activeScreen === 'aviso-detail'
        ? 'avisos'
        : 'inicio';

  const activeNavbarItemKey =
    activeScreen === 'avisos' || activeScreen === 'aviso-detail'
      ? 'avisos'
      : activeScreen === 'tickets' ||
          activeScreen === 'ticket-detail' ||
          activeScreen === 'new-ticket'
        ? 'tickets'
      : 'inicio';

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <Fragment>
        <Layout
          activeNavbarItemKey={activeNavbarItemKey}
          activeSidebarItemKey={activeSidebarItemKey}
          onAvisosPress={() => setActiveScreen('avisos')}
          onHomePress={() => setActiveScreen('home')}
          onNotificationsPress={() => setActiveScreen('notifications')}
          onProfilePress={() => setActiveScreen('account')}
          onTicketsPress={() => setActiveScreen('tickets')}
        >
          {screen}
        </Layout>
        <StatusBar style="dark" />
      </Fragment>
    </SafeAreaProvider>
  );
}

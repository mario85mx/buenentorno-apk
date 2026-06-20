import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from './Header';
import Navbar, { NavbarItem } from './Navbar';
import Sidebar, { SidebarItem } from './Sidebar';

export interface LayoutProps {
  children: ReactNode;
  contentKey?: string;
  onHomePress?: () => void;
  onAvisosPress?: () => void;
  onTicketsPress?: () => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  onLogout?: () => void;
  activeSidebarItemKey?: string;
  activeNavbarItemKey?: string;
  hasNotifications?: boolean;
  notificationCount?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    key: 'inicio',
    label: 'Inicio',
    icon: { library: 'ionicons', name: 'home-outline' },
  },
  {
    key: 'avisos',
    label: 'Avisos',
    icon: { library: 'feather', name: 'bell' },
  },
  {
    key: 'tickets',
    label: 'Tickets',
    icon: { library: 'material-icons', name: 'support-agent' },
  },
];

const navbarItems: NavbarItem[] = [
  { key: 'inicio', label: 'Inicio', icon: 'home-outline' },
  { key: 'avisos', label: 'Avisos', icon: 'pulse-outline' },
  { key: 'tickets', label: 'Tickets', icon: 'ticket-outline' },
];

export default function Layout({
  children,
  contentKey,
  onHomePress,
  onAvisosPress,
  onTicketsPress,
  onProfilePress,
  onNotificationsPress,
  onLogout,
  activeSidebarItemKey,
  activeNavbarItemKey,
  hasNotifications = true,
  notificationCount = 0,
  refreshing = false,
  onRefresh,
}: LayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(sidebarItems[0].key);
  const [activeNavbarItem, setActiveNavbarItem] = useState(navbarItems[0].key);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (activeSidebarItemKey) {
      setActiveSidebarItem(activeSidebarItemKey);
    }
  }, [activeSidebarItemKey]);

  useEffect(() => {
    if (activeNavbarItemKey) {
      setActiveNavbarItem(activeNavbarItemKey);
    }
  }, [activeNavbarItemKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [contentKey]);

  const shouldShowSidebar = isDesktop || isSidebarOpen;
  const contentWidthClass = useMemo(
    () => (isDesktop ? 'ml-72' : ''),
    [isDesktop],
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F6F3FA]">
      <View className="flex-1">
        {shouldShowSidebar ? (
          <>
            {!isDesktop ? (
              <Pressable
                className="absolute inset-0 z-10 bg-black/30"
                onPress={() => setIsSidebarOpen(false)}
              />
            ) : null}

            <View
              className={`absolute bottom-0 left-0 top-0 z-20 w-72 ${
                isDesktop ? '' : 'shadow-xl'
              }`}
            >
              <Sidebar
                activeItem={activeSidebarItem}
                items={sidebarItems}
                onLogout={onLogout}
                onSelectItem={(key) => {
                  setActiveSidebarItem(key);
                  if (key === 'inicio') {
                    onHomePress?.();
                  }
                  if (key === 'avisos') {
                    onAvisosPress?.();
                  }
                  if (key === 'tickets') {
                    onTicketsPress?.();
                  }
                  if (!isDesktop) {
                    setIsSidebarOpen(false);
                  }
                }}
              />
            </View>
          </>
        ) : null}

        <View className={`flex-1 ${contentWidthClass}`}>
          <Header
            hasNotifications={hasNotifications}
            notificationCount={notificationCount}
            onNotificationsPress={onNotificationsPress}
            onProfilePress={onProfilePress}
            showMenuButton={!isDesktop}
            onMenuPress={() => setIsSidebarOpen(true)}
          />

          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerClassName="px-5 py-5"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  colors={['#18052E']}
                  progressBackgroundColor="#FFFFFF"
                  refreshing={refreshing}
                  tintColor="#18052E"
                  onRefresh={onRefresh}
                />
              ) : undefined
            }
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {!isDesktop ? (
            <Navbar
              activeItem={activeNavbarItem}
              items={navbarItems}
              onSelectItem={(key) => {
                setActiveNavbarItem(key);
                if (key === 'inicio') {
                  onHomePress?.();
                }
                if (key === 'avisos') {
                  onAvisosPress?.();
                }
                if (key === 'tickets') {
                  onTicketsPress?.();
                }
              }}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

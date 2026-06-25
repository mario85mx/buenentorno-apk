import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from './Header';
import Navbar, { NavbarItem } from './Navbar';
import Sidebar, { SidebarItem } from './Sidebar';

export interface LayoutProps {
  children: ReactNode;
  contentKey?: string;
  onHomePress?: () => void;
  onCommonAreasPress?: () => void;
  onAvisosPress?: () => void;
  onSurveysPress?: () => void;
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
  showCommonAreasMenu?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    key: 'inicio',
    label: 'Inicio',
    icon: { library: 'ionicons', name: 'home-outline' },
  },
  {
    key: 'areas-comunes',
    label: 'Áreas',
    icon: { library: 'ionicons', name: 'calendar-outline' },
  },
  {
    key: 'avisos',
    label: 'Avisos',
    icon: { library: 'feather', name: 'bell' },
  },
  {
    key: 'encuestas',
    label: 'Encuestas',
    icon: { library: 'ionicons', name: 'stats-chart-outline' },
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
  onCommonAreasPress,
  onAvisosPress,
  onSurveysPress,
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
  showCommonAreasMenu = true,
}: LayoutProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 960;
  const shouldShowNavbar = !isDesktop;
  const mobileNavbarOffset = shouldShowNavbar ? 88 + insets.bottom : 0;
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
  const visibleSidebarItems = useMemo(
    () =>
      showCommonAreasMenu
        ? sidebarItems
        : sidebarItems.filter((item) => item.key !== 'areas-comunes'),
    [showCommonAreasMenu],
  );
  const visibleNavbarItems = useMemo(
    () =>
      showCommonAreasMenu
        ? navbarItems
        : navbarItems.filter((item) => item.key !== 'areas-comunes'),
    [showCommonAreasMenu],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-primary">
      <View className="flex-1 bg-[#F6F3FA]">
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
                items={visibleSidebarItems}
                onLogout={onLogout}
                onSelectItem={(key) => {
                  setActiveSidebarItem(key);
                  if (key === 'inicio') {
                    onHomePress?.();
                  }
                  if (key === 'areas-comunes') {
                    onCommonAreasPress?.();
                  }
                  if (key === 'avisos') {
                    onAvisosPress?.();
                  }
                  if (key === 'encuestas') {
                    onSurveysPress?.();
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
            contentContainerStyle={{
              paddingBottom: mobileNavbarOffset,
            }}
            style={{
              marginBottom: shouldShowNavbar ? mobileNavbarOffset : 0,
            }}
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

          {shouldShowNavbar ? (
            <View
              className="z-10 bg-primary"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingBottom: insets.bottom,
                elevation: 24,
                shadowColor: '#000000',
                shadowOpacity: 0.14,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: -3 },
                borderTopWidth: 1,
                borderTopColor: '#2D1B45',
              }}
            >
              <Navbar
                activeItem={activeNavbarItem}
                items={visibleNavbarItems}
                onSelectItem={(key) => {
                  setActiveNavbarItem(key);
                  if (key === 'inicio') {
                    onHomePress?.();
                  }
                  if (key === 'areas-comunes') {
                    onCommonAreasPress?.();
                  }
                  if (key === 'avisos') {
                    onAvisosPress?.();
                  }
                  if (key === 'encuestas') {
                    onSurveysPress?.();
                  }
                  if (key === 'tickets') {
                    onTicketsPress?.();
                  }
                }}
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

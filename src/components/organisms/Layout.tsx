import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
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
  onHomePress?: () => void;
  onAvisosPress?: () => void;
  onTicketsPress?: () => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
  activeSidebarItemKey?: string;
  activeNavbarItemKey?: string;
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
  onHomePress,
  onAvisosPress,
  onTicketsPress,
  onProfilePress,
  onNotificationsPress,
  activeSidebarItemKey,
  activeNavbarItemKey,
}: LayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(sidebarItems[0].key);
  const [activeNavbarItem, setActiveNavbarItem] = useState(navbarItems[0].key);

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
            onNotificationsPress={onNotificationsPress}
            onProfilePress={onProfilePress}
            showMenuButton={!isDesktop}
            onMenuPress={() => setIsSidebarOpen(true)}
          />

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 py-5"
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

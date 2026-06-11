import { ReactNode, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../atoms/Card';
import Header from './Header';
import Navbar, { NavbarItem } from './Navbar';
import Sidebar, { SidebarItem } from './Sidebar';

export interface LayoutProps {
  children: ReactNode;
  onHomePress?: () => void;
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
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
    key: 'areas',
    label: 'Áreas Comunes',
    icon: { library: 'material-icons', name: 'directions' },
  },
  {
    key: 'encuestas',
    label: 'Encuestas',
    icon: { library: 'material-icons', name: 'poll' },
  },
  {
    key: 'tickets',
    label: 'Tickets',
    icon: { library: 'material-icons', name: 'support-agent' },
  },
];

const navbarItems: NavbarItem[] = [
  { key: 'finanzas', label: 'Finanzas', icon: 'home-outline' },
  { key: 'avisos', label: 'Avisos', icon: 'pulse-outline' },
  { key: 'tickets', label: 'Tickets', icon: 'person-outline' },
];

export default function Layout({
  children,
  onHomePress,
  onProfilePress,
  onNotificationsPress,
}: LayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(sidebarItems[0].key);
  const [activeNavbarItem, setActiveNavbarItem] = useState(navbarItems[0].key);

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
              onSelectItem={setActiveNavbarItem}
            />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

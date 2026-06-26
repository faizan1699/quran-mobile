import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer as RawNavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Ionicons as RawIonicons,
  MaterialCommunityIcons as RawMaterialCommunityIcons,
} from '@expo/vector-icons';

// Import Screen Stack Parameter Types
import {
  RootStackParamList,
  TabParamList,
  QuranStackParamList,
  HadithStackParamList,
  HomeStackParamList,
  IbadaatStackParamList,
  MoreStackParamList,
} from './types';

// Import Screen Components
import SplashScreen from '@/screens/SplashScreen';
import HomeScreen from '@/screens/HomeScreen';
import LibraryScreen from '@/screens/LibraryScreen';
import BookDetailScreen from '@/screens/BookDetailScreen';
import ReaderScreen from '@/screens/ReaderScreen';
import DuaaScreen from '@/screens/DuaaScreen';
import QiblaScreen from '@/screens/QiblaScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import AppearanceScreen from '@/screens/AppearanceScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import AuthScreen from '@/screens/AuthScreen';
import ChangePasswordScreen from '@/screens/ChangePasswordScreen';
import QuranLandingScreen from '@/screens/QuranLandingScreen';
import SurahListScreen from '@/screens/SurahListScreen';
import QuranReaderScreen from '@/screens/QuranReaderScreen';
import IbadaatScreen from '@/screens/IbadaatScreen';
import TasbeehScreen from '@/screens/TasbeehScreen';
import AllahNamesScreen from '@/screens/AllahNamesScreen';
import GuideScreen from '@/screens/GuideScreen';
import NotesListScreen from '@/screens/NotesListScreen';
import NoteEditorScreen from '@/screens/NoteEditorScreen';

// Import Token Styles
import { typography } from '@/tokens';
import { useTheme } from '@/theme';
import { useTranslation } from '@/i18n';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const QuranStack = createNativeStackNavigator<QuranStackParamList>();
const HadithStack = createNativeStackNavigator<HadithStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const IbadaatStack = createNativeStackNavigator<IbadaatStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

// --- Inner Stack Navigators ---

function QuranStackScreen() {
  return (
    // @ts-ignore
    <QuranStack.Navigator screenOptions={{ headerShown: false }}>
      <QuranStack.Screen name="QuranLanding" component={QuranLandingScreen} />
      <QuranStack.Screen name="SurahList" component={SurahListScreen} />
    </QuranStack.Navigator>
  );
}

function HadithStackScreen() {
  return (
    // @ts-ignore
    <HadithStack.Navigator screenOptions={{ headerShown: false }}>
      <HadithStack.Screen name="Library" component={LibraryScreen} />
    </HadithStack.Navigator>
  );
}

function HomeStackScreen() {
  return (
    // @ts-ignore
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function IbadaatStackScreen() {
  return (
    // @ts-ignore
    <IbadaatStack.Navigator screenOptions={{ headerShown: false }}>
      <IbadaatStack.Screen name="Ibadaat" component={IbadaatScreen} />
      <IbadaatStack.Screen name="Qibla" component={QiblaScreen} />
      <IbadaatStack.Screen name="Duaa" component={DuaaScreen} />
      <IbadaatStack.Screen name="Tasbeeh" component={TasbeehScreen} />
      <IbadaatStack.Screen name="AllahNames" component={AllahNamesScreen} />
      <IbadaatStack.Screen name="Guide" component={GuideScreen} />
    </IbadaatStack.Navigator>
  );
}

function MoreStackScreen() {
  return (
    // @ts-ignore
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="Settings" component={SettingsScreen} />
      <MoreStack.Screen name="Appearance" component={AppearanceScreen} />
    </MoreStack.Navigator>
  );
}

const TAB_ICON_SIZE = 24;

// @expo/vector-icons ships its own @types/react, which clashes with the app's
// React 18 JSX namespace in a mixed-React monorepo. Alias to plain component
// types so they're valid JSX here (glyph names are verified at runtime).
type VectorIconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<VectorIconProps>;
const MaterialCommunityIcons =
  RawMaterialCommunityIcons as unknown as React.ComponentType<VectorIconProps>;

interface TabIconArgs {
  color: string;
  size: number;
}

// Per-tab vector icons (Ionicons / MaterialCommunityIcons) matching the design
const tabIcons: Record<keyof TabParamList, (args: TabIconArgs) => React.ReactNode> = {
  QuranStack: ({ color, size }) => (
    <Ionicons name="book-outline" size={size} color={color} />
  ),
  HadithStack: ({ color, size }) => (
    <MaterialCommunityIcons name="octagram-outline" size={size} color={color} />
  ),
  HomeStack: ({ color, size }) => (
    <Ionicons name="home-outline" size={size} color={color} />
  ),
  IbadaatStack: ({ color, size }) => (
    <MaterialCommunityIcons name="mosque" size={size} color={color} />
  ),
  MoreStack: ({ color, size }) => (
    <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />
  ),
};

// --- Main Tab Navigator ---

function TabNavigator() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    // @ts-ignore
    <Tab.Navigator
      initialRouteName="HomeStack"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.navActive,
        tabBarInactiveTintColor: theme.navInactive,
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: theme.bgNavBar, borderTopColor: theme.borderDivider },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="QuranStack"
        component={QuranStackScreen}
        options={{
          tabBarLabel: t('tabs.quran'),
          tabBarIcon: ({ color }) =>
            tabIcons.QuranStack({ color, size: TAB_ICON_SIZE }),
        }}
      />
      <Tab.Screen
        name="HadithStack"
        component={HadithStackScreen}
        options={{
          tabBarLabel: t('tabs.hadith'),
          tabBarIcon: ({ color }) =>
            tabIcons.HadithStack({ color, size: TAB_ICON_SIZE }),
        }}
      />
      <Tab.Screen
        name="HomeStack"
        component={HomeStackScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color }) =>
            tabIcons.HomeStack({ color, size: TAB_ICON_SIZE }),
        }}
      />
      <Tab.Screen
        name="IbadaatStack"
        component={IbadaatStackScreen}
        options={{
          tabBarLabel: t('tabs.ibadaat'),
          tabBarIcon: ({ color }) =>
            tabIcons.IbadaatStack({ color, size: TAB_ICON_SIZE }),
        }}
      />
      <Tab.Screen
        name="MoreStack"
        component={MoreStackScreen}
        options={{
          tabBarLabel: t('tabs.more'),
          tabBarIcon: ({ color }) =>
            tabIcons.MoreStack({ color, size: TAB_ICON_SIZE }),
        }}
      />
    </Tab.Navigator>
  );
}


const RootStackNavigator = RootStack.Navigator as any;
const RootStackScreen = RootStack.Screen as any;

const NavigationContainer = RawNavigationContainer as unknown as React.ComponentType<{
  children?: React.ReactNode;
}>;

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <RootStackNavigator screenOptions={{ headerShown: false }}>
        <RootStackScreen name="Splash" component={SplashScreen} />
        <RootStackScreen name="MainTabs" component={TabNavigator} />
        <RootStackScreen
          name="Profile"
          component={ProfileScreen}
          options={{ presentation: 'card' }}
        />
        <RootStackScreen
          name="Auth"
          component={AuthScreen}
          options={{ presentation: 'modal' }}
        />
        <RootStackScreen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ presentation: 'card' }}
        />
        <RootStackScreen name="BookDetail" component={BookDetailScreen} />
        <RootStackScreen name="Reader" component={ReaderScreen} />
        <RootStackScreen name="QuranReader" component={QuranReaderScreen} />
        <RootStackScreen name="NotesList" component={NotesListScreen} />
        <RootStackScreen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{ presentation: 'card' }}
        />
      </RootStackNavigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },
});

export default AppNavigator;

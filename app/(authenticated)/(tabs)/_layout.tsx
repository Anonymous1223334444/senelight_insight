import { Tabs } from 'expo-router';
import { HomeIcon, ChartBarIcon, UserIcon, ArrowsRightLeftIcon } from 'react-native-heroicons/mini';
import CustomTabs from "~/components/CustomTabs";
import { COLORS } from '~/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabs {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <HomeIcon size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Signalements',
          tabBarIcon: ({ color }) => <ArrowsRightLeftIcon size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color }) => <ChartBarIcon size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <UserIcon size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
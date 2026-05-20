// src/mobile/app/(app)/_layout.tsx
import { Tabs } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function AppLayout() {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.tabIconDefault,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Dash',
          tabBarIcon: ({ color }) => <IconSymbol name='house.fill' size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name='groups/index'
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => <IconSymbol name='person.3.fill' size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name='activities'
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color }) => <IconSymbol name='list.bullet' size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol name='person.crop.circle.fill' size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name='logout'
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}

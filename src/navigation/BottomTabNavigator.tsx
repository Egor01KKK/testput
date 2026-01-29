import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { BottomTabParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Screens
import ProfileScreen from '../screens/ProfileScreen';
import MyScheduleScreen from '../screens/MyScheduleScreen';
import SuitcaseScreen from '../screens/SuitcaseScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused, label }) => (
  <View style={styles.tabItem}>
    <Ionicons
      name={name}
      size={24}
      color={focused ? colors.primary : colors.text.secondary}
    />
    <Text
      style={[
        styles.tabLabel,
        { color: focused ? colors.primary : colors.text.secondary },
      ]}
    >
      {label}
    </Text>
  </View>
);

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-outline" focused={focused} label="Профиль" />
          ),
        }}
      />
      <Tab.Screen
        name="MyScheduleTab"
        component={MyScheduleScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="calendar-outline" focused={focused} label="Моё" />
          ),
        }}
      />
      <Tab.Screen
        name="SuitcaseTab"
        component={SuitcaseScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="briefcase-outline" focused={focused} label="Чемодан" />
          ),
        }}
      />
      <Tab.Screen
        name="FeedbackTab"
        component={FeedbackScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="chatbubble-outline" focused={focused} label="Отзыв" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...typography.captionSmall,
    marginTop: 4,
  },
});

export default BottomTabNavigator;

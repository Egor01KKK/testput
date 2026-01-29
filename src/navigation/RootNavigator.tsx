import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from '../types';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import MainMenuScreen from '../screens/MainMenuScreen';
import MapScreen from '../screens/MapScreen';
import ProgramScreen from '../screens/ProgramScreen';
import OffersScreen from '../screens/OffersScreen';
import TourDetailScreen from '../screens/TourDetailScreen';
import ExcursionsScreen from '../screens/ExcursionsScreen';
import ExcursionDetailScreen from '../screens/ExcursionDetailScreen';
import QuestScreen from '../screens/QuestScreen';
import FAQScreen from '../screens/FAQScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyScheduleScreen from '../screens/MyScheduleScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SuitcaseScreen from '../screens/SuitcaseScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import { LoadingIndicator } from '../components/common';

const Stack = createStackNavigator<RootStackParamList>();

const STORAGE_KEY_REGISTERED = '@user_registered';

export const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const registered = await AsyncStorage.getItem(STORAGE_KEY_REGISTERED);
      setIsRegistered(registered === 'true');
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName={isRegistered ? 'Main' : 'Welcome'}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Main" component={MainMenuScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Program" component={ProgramScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="TourDetail" component={TourDetailScreen} />
      <Stack.Screen name="Excursions" component={ExcursionsScreen} />
      <Stack.Screen name="ExcursionDetail" component={ExcursionDetailScreen} />
      <Stack.Screen name="Quest" component={QuestScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MySchedule" component={MyScheduleScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Suitcase" component={SuitcaseScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;

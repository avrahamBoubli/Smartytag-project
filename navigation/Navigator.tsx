import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { Icon } from '@ui-kitten/components';
import Encodeur from '../screens/Encodeur';
import LoginScreen from '../screens/Login';
import CashierScreen from '../screens/Cashier';
import { DashboardScreen } from '../screens/Dashboard';
import { DefaultTheme } from '@react-navigation/native';
import { UserRole } from '../assets/types';
import { userRole$ } from '../state/state';
import { NotificationScreen } from '../screens/Notification';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { pairwise } from 'rxjs/operators';
import { AppHeader } from '../components/Header';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TheftSpyScreen } from '../screens/TheftSpy';

const navTheme = DefaultTheme;
navTheme.colors.background = 'white';
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigation() {

  const [userRole, setUserRole] = useState<any>(null);

  useEffect(() => {
    userRole$.pipe(pairwise())
      .subscribe(([previousRole, newRole]) => {
        if (previousRole !== newRole) {
          setUserRole(newRole);
        }
      })
  }, [])

  const Logout = (props: any) => {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem label="Logout" onPress={() => userRole$.next(null as any)} />
      </DrawerContentScrollView>
    )
  }

  const screenOpts = ({ route }: any) => ({
    tabBarIcon: ({ focused, color, size }: any) => {
      let iconName;

      if (route.name === 'Dashboard') {
        iconName = 'options-outline'
      } else if (route.name === 'Cashier') {
        iconName = 'shopping-cart-outline';
      } else {
        iconName = 'square-outline';
      }

      // You can return any component that you like here!
      return <Icon name={iconName} style={{
        width: 28,
        height: 28
      }} fill={color} />;
    },
  });


  const tabBarOpts = {
    activeTintColor: 'tomato',
    inactiveTintColor: 'gray',
  }



  const Routing = () => {
    const unMountOptions = { unmountOnBlur: true };
    switch (userRole) {
      case UserRole.cashier:
        return (
          <Tab.Navigator initialRouteName="Home" screenOptions={screenOpts} tabBarOptions={tabBarOpts}>
            <Tab.Screen name="Tags" component={Encodeur} options={unMountOptions} />
            <Tab.Screen name="Cashier" component={CashierScreen} options={unMountOptions} />
          </Tab.Navigator>
        )
      case UserRole.admin:
        return (
          <Tab.Navigator initialRouteName="Home" screenOptions={screenOpts} tabBarOptions={tabBarOpts}>
            <Tab.Screen name="Tags" component={Encodeur} options={unMountOptions} />
            <Tab.Screen name="Cashier" component={CashierScreen} options={unMountOptions} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
          </Tab.Navigator>
        )
      case UserRole.theftSpy:
        return (
          <Tab.Navigator initialRouteName="Home" screenOptions={screenOpts} tabBarOptions={tabBarOpts}>
            <Tab.Screen name="Alerts" component={TheftSpyScreen} options={unMountOptions} />
          </Tab.Navigator>
        )
      default:
        return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Log In" component={LoginScreen}></Stack.Screen>
          </Stack.Navigator>
        )
    }
  }

  return (
    <NavigationContainer theme={navTheme}>
      {userRole && <AppHeader />}
      <Routing />
    </NavigationContainer>
  )
}




const styles = StyleSheet.create({
  btnContainer: {
    display: 'flex', flexDirection: 'row'
  }
});


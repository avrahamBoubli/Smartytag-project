import React, { useEffect } from 'react';

import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './navigation/Navigator';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Alert } from 'react-native';

import * as eva from '@eva-design/eva';
import { snifId$, userRole$ } from './state/state';

import messaging from '@react-native-firebase/messaging';
import { USBService } from './state/usb.service';
import { FirebaseService } from './state/firebase.service';

export const appScope: { USB: USBService, firebase: FirebaseService } = {
  ...global,
  USB: new USBService(),
  firebase: new FirebaseService()
};

export const App = () => {

  let snifIdSub: any;


  useEffect(() => {
    // remove, for testing only
    userRole$.next(null as any);
    // subscribe to notification topic

    snifIdSub = snifId$.subscribe(snifId => {
      if (snifId) {
        messaging().subscribeToTopic(`${snifId}`);
        appScope.USB.initEncodeur();
      }
    })

    // foreground notifications
    messaging().onMessage(async remoteMessage => {
      try {
        Alert.alert(`${(remoteMessage as any).notification.body}`);
        appScope.USB.alert();
      } catch (e) {
        console.log(`erorrreeee: ${e}`)
      }
      // todo: define what to do here
    });

    return function () {
      snifIdSub.unsubscribe();
      appScope.USB.stopUsbListener();
    };
  }, []);



  return (
    <SafeAreaProvider>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <AppNavigation />
      </ApplicationProvider>
    </SafeAreaProvider>
  )
};


/**
 * @format
 */

import { AppRegistry, Alert } from 'react-native';
import { App, appScope } from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    try {
        appScope.USB.alert();
        Alert.alert(remoteMessage?.notification.body);
    } catch (e) {
        console.log(`erroreeee: ${e}`);
    }
});


AppRegistry.registerComponent(appName, () => App);

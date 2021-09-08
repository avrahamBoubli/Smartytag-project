import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text } from '@ui-kitten/components';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { interval } from 'rxjs';
import { appScope } from '../App';
import { AntitheftState, ProductTemplate } from '../assets/types';
import { Product } from '../components/Product';
import { LoginBkImage } from '../images';
import { antiTheftState$, getAntiTheftState } from '../state/state';

/**
 * This component must know how to communicate with both devices:
 * - The receptor: receives any payload when a tag is stolen (de-magnetized)
 * - The burner: read and write operations (read the ID of the article => update the matching article in the database),
 *  then write an empty ID on the tag (reset it)
 * 
 * For the burner, we need to send a tram every 300 ms to make sure it reading properly.
 * 
 * When the component loads, we make sure we are connected to both devices, else we present the dialog
 * @param props 
 */

export const TheftSpyScreen = () => {
  const [usbState, setUsbState] = useState(new AntitheftState());

  useEffect(() => {
    let mounted = true;
    appScope.USB.isTheftSpyMode = true;

    // appScope.USB.debugTheftSpy();

    // lecture de tag toutes les 200 ms
    const interval$ = interval(770).subscribe(() => {
      const { isTheftSpyMode } = appScope.USB;
      const keepReading = getAntiTheftState('keepReading')
      if (mounted && isTheftSpyMode && keepReading) {
        appScope.USB.readTag();
      }
    })
    // nous renvoi la template du tag vole, son id etc..
    const state$ = antiTheftState$
      .subscribe((state: AntitheftState) => setUsbState(state));

    return () => {
      mounted = false;
      interval$ && interval$.unsubscribe();
      appScope.USB.isTheftSpyMode = false;
      state$ && state$.unsubscribe();
    }
  }, []);

  const { product } = usbState;
  return (
    <ImageBackground source={LoginBkImage} style={{ width: '100%', height: '100%' }}>
      <View style={styles.container}>
        <Text category="s1" style={{ color: 'white', padding: 20 }}>{usbState.message}</Text>
        {!!product && Object.keys(product).length > 0 && (
          <View style={styles.alert}>
            <Text style={{ color: 'white' }}>Stolen Product: {usbState.stolenTag}</Text>
            <Product template={usbState.product as ProductTemplate} />
          </View>
        )}
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', height: hp(100)
  },
  alert: {
    padding: 20,
    display: 'flex',
    alignSelf: 'stretch',
    height: 120
  }
});

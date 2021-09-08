import * as React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { AppLogo } from '../images';
import { logout } from '../state/state';
import { Button } from '@ui-kitten/components';

export const AppHeader = () => {

  return (
    <View style={styles.container}>
      <Image source={AppLogo} />

      <Button onPress={logout} appearance='ghost' status='basic'>
        LOGOUT
    </Button>

    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: 70,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center', paddingRight: 15
  },
  icon: {
    width: 32,
    height: 32,
  },
});

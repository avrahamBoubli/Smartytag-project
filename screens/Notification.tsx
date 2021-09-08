import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface componentNameProps {}

export const NotificationScreen = (props: componentNameProps) => {
  return (
    <View style={styles.container}>
      <Text>Here you'll get notifications</Text>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {}
});

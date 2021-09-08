import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Button, Text } from '@ui-kitten/components';


type state = {
  tagId: string,
  onOverride: () => void,
  onCancel: () => void
}

export const ExistingTag = ({ onOverride, onCancel, tagId }: state) => {
  const Footer = ({ id }: any) => {
    return (
      <View style={[styles.footerContainer, { marginVertical: 10 }]}>
        <Button appearance='ghost' status='basic' onPress={onCancel}>Cancel</Button>
        <Button status='warning' onPress={onOverride}>Override</Button>
      </View>
    )
  }
  return (
    <Card style={styles.card} status='warning' footer={Footer}>
      <Text category='h6' style={{ fontWeight: 'bold' }}>Beaware!</Text>
      <Text>This tag is already encoded ({tagId}), what do you want to do ?</Text>
    </Card>

  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 10, alignSelf: 'stretch',

  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 10
  },
})
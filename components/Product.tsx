import * as React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';
import { ProductTemplate } from '../assets/types';
import { getProductIcon } from '../images';
import { blueColor } from '../style';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface TemplateItemProps {
  template: ProductTemplate;
}


// list item component
export const Product = ({ template }: TemplateItemProps) => {

  return (
    <View style={styles.item}>
      <View style={[styles.row, styles.justifyBetween]}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Image source={getProductIcon(template.type)} />
          </View>
          <View style={[styles.column, { marginLeft: 10 }]}>
            <Text style={styles.productType}>{template.type}</Text>
            <Text>{template.brand}, {template.model}</Text>
            <Text style={styles.secondaryTxt}>Size: {template.size}, Price: {template.price}₪</Text>
          </View>
        </View>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    width: wp('95%'),
    maxHeight: hp('50%'),
    backgroundColor: 'transparent',
  },
  title: {
    marginTop: 15,
    marginBottom: 20
  },
  item: {
    backgroundColor: "#F6F6F6",
    borderRadius: 15,
    marginTop: 10, padding: 10
  },
  text: {
    color: '#0959AC'
  },
  row: {
    display: 'flex', flexDirection: 'row'
  },
  iconContainer: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70
  },
  productType: {
    color: blueColor, fontWeight: 'bold'
  },
  column: {
    display: "flex", flexDirection: 'column'
  },
  secondaryTxt: {
    color: '#AAABAD'
  },
  justifyBetween: {
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

});

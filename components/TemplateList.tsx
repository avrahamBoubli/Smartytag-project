import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ProductTemplate } from '../assets/types';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Text, List } from '@ui-kitten/components';
import { roundButton, blueColor, dangerRoundButton } from '../style';
import { getProductIcon } from '../images';


interface TemplateListProps {
  templates: ProductTemplate[];
  activeTemplateCodeBar: number | undefined;
  onSelect: (template: ProductTemplate) => void;
  onDelete: (template: ProductTemplate) => void
}

export const TemplateList = ({ templates, onSelect, onDelete,
  activeTemplateCodeBar }: TemplateListProps) => {

  // select template button
  const SelectTemplateButton = ({ template }: any) => {
    const isSelected = !!activeTemplateCodeBar && activeTemplateCodeBar === template.barCode;
    const text = isSelected ? 'Unselect' : 'Select ';
    return (
      <TouchableOpacity onPress={() => onSelect(isSelected ? null : template)}
        style={roundButton}>
        <Text style={{ color: 'white' }}>{text}</Text>
      </TouchableOpacity>
    )
  }



  const DeleteButton = ({ template }: any) => {
    return (
      <TouchableOpacity onPress={() => onDelete(template)}
        style={[dangerRoundButton, { marginTop: 5 }]}>
        <Text style={{ color: 'white' }}>Delete</Text>
      </TouchableOpacity>
    )
  }

  // list item component
  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.item}>
        <View style={[styles.row, styles.justifyBetween]}>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Image source={getProductIcon(item.type)} />
            </View>
            <View style={[styles.column, { marginLeft: 10 }]}>
              <Text style={styles.productType}>{item.type}</Text>
              <Text>{item.brand}, {item.model}</Text>
              <Text style={styles.secondaryTxt}>Size: {item.size}, Price: {item.price}₪</Text>
              <Text style={styles.secondaryTxt}>In stock: {item.inStock}</Text>
            </View>
          </View>
          <View>
            <SelectTemplateButton template={item as ProductTemplate} />
            <DeleteButton template={item as ProductTemplate} />
          </View>
        </View>
      </View>
    )
  }


  // list
  return (
    <List
      style={styles.container}
      data={templates}
      renderItem={renderItem}
    />
  );
};

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

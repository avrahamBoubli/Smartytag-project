import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ClothesSize, ProductType, ProductTypeList, ShoeSize } from '../assets/types';
import { IndexPath, Input, Select, SelectItem, Icon } from '@ui-kitten/components';
import { BarCodeScanner } from './BarCodeScanner';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { blueColor, roundButton } from '../style';
import { appScope } from '../App';
import { updateTemplates } from '../state/state';


export const TemplateBuilder = ({ onComplete, onAboart }: any) => {

  const productTypes = ProductTypeList();
  const [selectedProductIndex, setSelectedProductIndex] = useState(new IndexPath(1));
  const [productSizes, setProductSize] = useState<any>(ClothesSize);
  const [selectedProductSize, setSelectedProductSizeIndex] = useState(new IndexPath(1));
  const [price, setPrice] = useState<number>();
  const [brand, setBrand] = useState();
  const [model, setModel] = useState();
  const [showCamera, setShowCamera] = useState(false);
  const [barcode, setBarcode] = useState<string>();


  const saveTemplate = async () => {

    const type = productTypes[selectedProductIndex.row];
    const isShoes = type === ProductType.Shoes;
    const size = isShoes ? ShoeSize[selectedProductSize.row] : ClothesSize[selectedProductSize.row];

    const template: any = {
      type, size,
      date: new Date().getTime(),
      barCode: barcode as any,
      price: price as number,
      model, brand,
      inStock: 0,
      soldUnits: 0
    };
    await appScope.firebase.saveTemplate(template);
    updateTemplates(template);
    onComplete();
  }



  const handleProductTypeChange = (index: any) => {
    setSelectedProductIndex(index);
    const product = productTypes[index.row];
    const isShoes = product === ProductType.Shoes;
    setProductSize(isShoes ? ShoeSize : ClothesSize);
  }

  const CancelButton = () => {
    return (
      <TouchableOpacity onPress={() => onAboart()} style={styles.backBtn}>
        <Icon name="arrow-back-outline" fill={blueColor} style={{ height: 20, width: 20 }} />
        <Text style={{ color: blueColor, fontWeight: 'bold' }}>Back</Text>
      </TouchableOpacity>
    )
  }

  const ScanBarCodeBtn = () => {
    return (
      <TouchableOpacity onPress={() => setShowCamera(true)} style={styles.scanBarCode}>
        <Icon name="camera-outline" fill={blueColor}
          style={{ height: 30, width: 30, marginRight: 10 }} />
      </TouchableOpacity>
    )
  }


  const onBarCodeDetected = (code: string) => {
    setBarcode(code);
    setShowCamera(false)
  }


  return showCamera ?
    (
      <View style={styles.scanner}>
        <BarCodeScanner onBarCode={(code: any) => onBarCodeDetected(code)} />
      </View>
    ) :
    (
      <View style={styles.container}>
        <CancelButton />
        <Select
          style={styles.select}
          size='medium'
          label="Type of product"
          placeholder="Shoes, Pants ..."
          value={productTypes[selectedProductIndex.row]}
          selectedIndex={selectedProductIndex as any}
          onSelect={index => handleProductTypeChange(index)}>
          {
            productTypes.map(el => <SelectItem title={el} key={el} />)
          }
        </Select>

        <Select
          style={styles.select}
          size='medium'
          label="size"
          placeholder={productSizes[0]}
          value={productSizes[selectedProductSize.row]}
          selectedIndex={selectedProductSize as any}
          onSelect={index => setSelectedProductSizeIndex(index as any)}>
          {
            productSizes.map((el: any) => <SelectItem title={el} key={el} />)
          }
        </Select>

        <Input
          placeholder='Price'
          label="price"
          value={price as any}
          keyboardType='number-pad'
          onChangeText={value => setPrice(value as any)}
        />

        <Input
          placeholder='Brand'
          label="Brand"
          value={brand}
          onChangeText={data => setBrand(data as any)}
        />

        <Input
          placeholder='Model'
          label="Model"
          value={model}
          onChangeText={data => setModel(data as any)}
        />


        <View style={styles.barcode}>
          <Input
            placeholder='BarCode'
            label="barcode"
            value={barcode as any}
            keyboardType='number-pad'
            onChangeText={value => setBarcode(value as any)}
            style={{ marginRight: 15, flex: 1 }}
          />
          <ScanBarCodeBtn />
        </View>




        {(!showCamera && !!barcode) && (
          <View style={styles.saveContainer}>
            <TouchableOpacity onPress={() => saveTemplate()} style={styles.addTemplate}>
              <Text style={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}>ADD TEMPLATE</Text>
            </TouchableOpacity>
          </View>

        )}
      </View>
    )
};


const styles = StyleSheet.create({
  container: {
    flex: 1, alignSelf: 'stretch', margin: 20
  },
  select: {
    marginVertical: 2,
  },
  barcode: {
    marginTop: 10, display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanner: {
    marginTop: hp('10%'),
    marginLeft: wp('10%'),
    position: 'absolute',
    bottom: hp('3%')
  },
  barcodeActions: {
    flexDirection: 'row',
  },
  saveContainer: {
    display: 'flex', flexDirection: 'row', justifyContent: 'center',
  },

  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBarCode: {

    display: 'flex', flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  backBtn: {
    display: 'flex', flexDirection: 'row', alignSelf: 'stretch', marginBottom: 15
  },
  addTemplate: {
    ...roundButton, width: '50%', marginTop: 10
  },
  scannedBarCode: {
    fontWeight: 'bold', fontSize: 18, marginVertical: 7, color: '#666'
  }
});

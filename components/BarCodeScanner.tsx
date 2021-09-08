import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GoogleVisionBarcodesDetectedEvent, RNCamera } from 'react-native-camera';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';



export const BarCodeScanner = (props: any) => {
  let camera: any = null;
  const { onBarCode } = props;

  const handleBarCode = ({ barcodes }: GoogleVisionBarcodesDetectedEvent) => {
    const code = parseInt(barcodes[0].data, 10) as any;
    const isValidBarCode = Number.isInteger(code);
    if (isValidBarCode) {
      // we have detected a bar code
      onBarCode(code);
    }
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={ref => {
          camera = ref;
        }}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.on}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        onGoogleVisionBarcodesDetected={(event) => handleBarCode(event)} />
    </View>

  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
   height: hp('100%'),
   width: wp('100%')
  }
});
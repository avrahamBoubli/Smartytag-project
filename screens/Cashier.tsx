import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, ImageBackground } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { interval } from 'rxjs';
import { getProductIcon, LoginBkImage } from '../images';
import { blueColor } from '../style';
import { appScope } from '../App';
import { cashierState$, getCashierState, updateCashierState } from '../state/state';
import { CashierState, ProductTemplate } from '../assets/types';


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

const CashierScreen = () => {
  const [connected, setConnected] = useState(false);
  const [cashierState, setCashierState] = useState<Partial<CashierState>>({});

  useEffect(() => {
    let mounted = true;
    appScope.USB.isCashierMode = true;


    const cashierStateRef = cashierState$.subscribe(async (state: CashierState) => {
      setCashierState(state);
    });

    const interval$ = interval(2500).subscribe(() => {
      const { isConnected } = appScope.USB;
      const keepReading = getCashierState('keepReading');
      if (mounted && keepReading && isConnected) {
        appScope.USB.readTag();
      }
      if (isConnected !== connected) {
        setConnected(isConnected);
      }

    })
    return () => {
      appScope.USB.isCashierMode = false;
      mounted = false;
      interval$ && interval$.unsubscribe();
      cashierStateRef && cashierStateRef.unsubscribe();
      updateCashierState(new CashierState());
    }
  }, []);


  const Product = () => {
    const product = cashierState.product as ProductTemplate;
    return (
      <ImageBackground source={LoginBkImage} style={[{ width: '100%'}, styles.container]}>
        <View style={styles.item}>
          <Text>{connected ? 'Connected' : 'Not connected'}</Text>
          <Text style={{ marginBottom: 10 }}>{cashierState.message}</Text>
          {!!product && Object.keys(product).length > 1 && (
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Image source={getProductIcon(product.type)} />
              </View>
              <View style={[styles.column, { marginLeft: 10 }]}>
                <Text style={styles.productType}>{product.type}</Text>
                <Text>{product.brand}, {product.model}</Text>
                <Text style={styles.secondaryTxt}>Size: {product.size}, Price: {product.price}₪</Text>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    )
  }


  return (
    <View style={styles.container}>
      <Product />
    </View>
  );
};

export default CashierScreen;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', height: hp(100)
  },

  title: {
    marginTop: 15,
    marginBottom: 20
  },
  item: {
    backgroundColor: "#F6F6F6",
    borderRadius: 15,
    marginTop: 10, padding: 10,
    width: '90%'
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
  }
});

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ProductTemplate } from '../assets/types';
import { Text, Select, SelectItem, IndexPath, ListItem, List } from '@ui-kitten/components';
import { snifData$ } from '../state/state';
import { appScope } from '../App';



export const DashboardScreen = () => {

  const [snifs, setSnifs] = useState<any>(null);
  const [snifList, setSnifList] = useState<{ id: number, name: string, address: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState(new IndexPath(0));

  useEffect(() => {
    init();
  })

  const init = async () => {
    let mounted = true;

    if (mounted) {
      let map: any = {};
      const snifsDropDownList = [];
      // first we get the data already fetched at login
      const { snifsList } = snifData$.getValue() as any;

      for (const snifId of snifsList) {
        const templates = await appScope.firebase.getSnifTemplates(snifId);
        const metadata = await appScope.firebase.getSnifMetadata(snifId, false) as any;
        console.log(templates.length);
        snifsDropDownList.push({ id: snifId, name: metadata.store_name, address: metadata.store_address })

        map[snifId] = {
          templates,
          metadata,
        };
      }

      setSnifList(snifsDropDownList);
      setSnifs(map)
    };

    return () => {
      mounted = false;
    }
  }

  const StoreSelector = () => {
    const displayValue = `${snifList[selectedStore.row].name} (${snifList[selectedStore.row].address})`;
    return (
      <Select
        value={displayValue}
        selectedIndex={selectedStore}
        onSelect={index => setSelectedStore(index as any)}>
        {snifList.map(function (store) {
          return (<SelectItem title={`${store.name} (${store.address})`} key={store.id} />)
        })}
      </Select>
    )
  }


  const kFormatter = (num: number): any => {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1) as any) + 'K' : Math.sign(num) * Math.abs(num)
  }

  const getStats = (snifId: number) => {
    let numberOfArticles = 0;
    const totalRevenue = snifs[snifId].templates.reduce((total: any, template: ProductTemplate) => {
      total += parseInt(template.price as any, 10) * template.soldUnits;
      numberOfArticles += template.inStock;
      return total;
    }, 0);

    return { numberOfArticles, totalRevenue };
  }

  const Statistics = () => {
    if (snifList.length > 0 && !!snifs) {
      const selectedSnif = snifList[selectedStore.row].id;
      let { numberOfArticles, totalRevenue } = getStats(selectedSnif);
      totalRevenue = kFormatter(totalRevenue);
      return (
        <View style={[styles.row, styles.spaceBetween]}>
          <View style={[styles.numOfArticles, styles.stat, styles.column, styles.center]}>
            <Text category="h1" style={{ color: 'white' }}>{numberOfArticles}</Text>
            <Text category="h4" style={{ color: 'white' }}>Articles</Text>
          </View>
          <View style={[styles.turnover, styles.stat, styles.column, styles.center]}>
            <Text category="h1" style={{ color: 'white' }}>{totalRevenue}₪</Text>
            <Text category="h4" style={{ color: 'white' }}>Total Revenu</Text>
          </View>
        </View>
      )
    } else {
      return (<Text>Loading...</Text>)
    }

  }

  const TemplateList = () => {
    if (snifList.length > 0 && !!snifs) {
      const snifId = snifList[selectedStore.row].id;
      const snif = snifs[snifId];
      const templateItem = ({ item: { type, model, brand, price, soldUnits, inStock } }: any) => {
        const revenu = parseInt(price, 10) * (soldUnits || 0);
        const percentage = Math.round(revenu / price * 100);
        const title = `Sold ${soldUnits} ${soldUnits > 0 ? 'times': 'time'}`;
        return (
          <ListItem
            title={`${type} ${brand} ${model}`}
            description={`${title}, ${percentage}% of total revenu, in stock: ${inStock}`}
          />
        )
      }

      return (
        <List
          style={styles.container}
          data={snif.templates}
          renderItem={templateItem as any}
        />
      );
    } else {
      return (<Text>Loading Templates ...</Text>)
    }

  }

  return (
    <View style={styles.container}>
      {snifList.length > 0 ? (
        <>
          <StoreSelector />
          <View style={styles.stats} >
            <Statistics />
          </View>
          <TemplateList />
        </>
      ) : (<Text>Loading your data</Text>)}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: hp(100),
    padding: 10
  },

  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  stats: {
    marginTop: 20, marginBottom: 20
  },
  center: {
    justifyContent: 'center', alignItems: 'center'
  },

  storeName: {
    backgroundColor: 'orange',
    display: 'flex',
    flexDirection: 'row'
  },

  spaceBetween: {
    justifyContent: 'space-between'
  },

  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  stat: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5
  },
  numOfArticles: {
    backgroundColor: '#2DC0B1'
  },
  turnover: {
    backgroundColor: '#0080ff'
  }
});


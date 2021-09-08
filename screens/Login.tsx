import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Text } from 'react-native';
import { Input, Spinner, Select, SelectItem, IndexPath, Button } from '@ui-kitten/components';
import auth from '@react-native-firebase/auth';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { saveUid, setAdminUser, setSnifId, setUserRole } from '../state/storage';
import { UserRole } from '../assets/types';
import { snifId$, userRole$ } from '../state/state';
import { FirebaseService } from '../state/firebase.service';
import { roundButton } from '../style';
import { LoginBkImage } from '../images';

const fireService = new FirebaseService();
interface componentNameProps {
  email: string;
  password: string;
  snif_id: number;
}

const LoginScreen = (props: componentNameProps) => {

  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('123456');
  const [snif_id, setSnif_id] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(new IndexPath(0));
  const [errorMessage, setErrorMessage] = useState(null as any);
  const roles = [UserRole.admin, UserRole.cashier, UserRole.theftSpy];
  // either as admin or cashier
  const login = async () => {

    setErrorMessage(null);

    const role = userRole();

    setLoading(true);

    const loginCall = auth().signInWithEmailAndPassword(email, password);
    const session = await asyncWithError(loginCall);

    if (session && session.user) {
      const { uid } = session.user;
      saveUid(uid);

      await setSnifId(snif_id as any);

      snifId$.next(snif_id);
      // get app data
      const snifData: any = await asyncWithError(fireService.getSnif());

      const isAllowed = role === UserRole.admin ?
        (snifData.snif?.adminUsers || []).includes(uid) : snifData.snif.users.includes(uid);

      if (isAllowed) {
        const { snif } = snifData;
        setLoading(false);
        const admin = snif?.admins;
        if (admin && admin.email === email) {
          setAdminUser(admin);
        }
        setRole();
      } else {
        setLoading(false);
        setErrorMessage("User does not belong to this Snif or your role is not right");
      }

    }

  }


  const asyncWithError = async (cb: any) => {
    try {
      return await cb;
    } catch (error) {
      setLoading(false);
      setErrorMessage('Wrong Login Credentials!');
    }
  }

  const userRole = (): string => {
    return roles[selectedRole.row];
  }


  const setRole = () => {
    setUserRole(userRole());
    userRole$.next(userRole());
  }

  const Role = () => {
    return (
      <Select style={styles.field}
        value={roles[selectedRole.row]}
        selectedIndex={selectedRole}
        onSelect={index => setSelectedRole(index as any)}>
        {roles.map(function (role) {
          return (<SelectItem title={role} key={role} />)
        })}
      </Select>
    )
  }

  return (
    <ImageBackground source={LoginBkImage} style={{ width: '100%', height: '100%' }}>
      <View style={styles.container}>
        <View style={styles.form}>
          <Role />

          {userRole() !== UserRole.theftSpy && <View>
            <Input style={styles.field}
              placeholder='Email'
              textStyle={{ color: 'white' }}
              placeholderTextColor="white"
              onChangeText={d => setEmail(d)}
            />
            <Input style={styles.field}
              placeholder='Password'
              textStyle={{ color: 'white' }}
              placeholderTextColor="white"
              onChangeText={d => setPassword(d)}
            />
          </View>}

          <Input style={styles.field}
            placeholder='Snif ID'
            textStyle={{ color: 'white' }}
            placeholderTextColor="white"
            onChangeText={snifId => setSnif_id(snifId as any)}
          />

          {errorMessage && (<Text style={{ fontWeight: 'bold', color: 'red' }}>{errorMessage}</Text>)}

          <View style={styles.action}>
            {!loading && <Button onPress={() => login()} style={roundButton} disabled={!snif_id}>LOGIN</Button>}
            {loading && <Spinner status="basic" />}
          </View>
        </View>
      </View>
    </ImageBackground>

  );
};


export default LoginScreen


const styles = StyleSheet.create({
  container: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: hp('100')
  },
  form: {
    width: wp('80')
  },



  btn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20
  },
  action: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  field: {
    color: 'white',
    marginBottom: 15,
    borderRadius: 100,
    backgroundColor: 'rgba(52, 52, 52, 0.6)'
  }
});

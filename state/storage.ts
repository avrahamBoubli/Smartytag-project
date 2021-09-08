import AsyncStorage from '@react-native-async-storage/async-storage';
import { Admin } from '../assets/types';


const uid_key = '@uid';
const usbPermissionKey = '@permissionGranted';
const snifIdKey = '@snifId';
const userRoleKey = '@userRole';
const adminUserKey = '@adminUser';


export const saveUid = async (uid: string) => {
  try {
    await AsyncStorage.setItem(uid_key, uid)
  } catch (e) {
    // saving error
  }
}

export const getUid = async () => {
  try {
    const value = await AsyncStorage.getItem(uid_key)
    if (value !== null) {
      return value
    }
  } catch (e) {
    // error reading value
  }
}

export const getSnifId = async () => {
  try {
    const value = await AsyncStorage.getItem(snifIdKey);
    if (value) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.log(e)
  }
}

export const setSnifId = async (id: string) => {
  try {
    await AsyncStorage.setItem(snifIdKey, JSON.stringify(id));
  } catch (e) {
    console.log('cannot set snif id');
  }
}


export const saveUSBPermission = async (granted: boolean) => {
  try {
    await AsyncStorage.setItem(usbPermissionKey, JSON.stringify(granted));
  } catch (e) {
    console.log(e)
  }
}

export const setUserRole = async (role: string) => {
  try {
    await AsyncStorage.setItem(userRoleKey, role);
  } catch (e) {
    console.log(e);
  }
}

export const getUserRole = async () => {
  try {
    return AsyncStorage.getItem(userRoleKey);
  } catch (e) {
    console.log(e);
  }
}

export const setAdminUser = async (user: Admin) => {
  try {
    await AsyncStorage.setItem(adminUserKey, JSON.stringify(user));
  } catch (e) {
    console.log(e);
  }
}

export const getAdminUser = async () => {
  try {
    const admin = await AsyncStorage.getItem(adminUserKey);
    if (admin) { return JSON.parse(admin) }
  } catch (e) {
    console.log(e);
  }
}



export const getUsbPermission = async () => {
  try {
    const value = await AsyncStorage.getItem(usbPermissionKey);
    if (value !== null) {
      return JSON.parse(value)
    }
  } catch (e) {
    // error reading value
  }
}

export const resetLocalStorage = () => {
  AsyncStorage.clear();
}

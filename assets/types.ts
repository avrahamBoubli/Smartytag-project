import { IDevice } from "react-native-serialport";

export type Admin = {
  emails: string[];
  snifs: number[];
}


export type Snif = {
  tags: TagReference[];
  templates: ProductTemplate[];
  admins?: Admin;
  store_name?: string;
  alerts?: { barCode: string };
  users: string[];
  adminUsers: string[];
  snifsList?: number[];
}

export type Store = {
  snif: Snif;
  templates: ProductTemplate[];
  tags: TagReference[];
}

export type TagReference = {
  barCode: number;
  lastUsed: number;
  id?: string;
}



export type ProductTemplate = {
  type: string;
  size: string | number;
  date: number;
  barCode: number;
  brand?: string;
  model?: string;
  price: number;
  tagId?: number;
  soldUnits: number;
  inStock: number;
  onComplete: () => void;
  onAboart: () => void;
}


export const ProductType = {
  Pants: 'Pants',
  Shirts: 'Shirts',
  Sweater: 'Sweater',
  Dress: 'Dress',
  Hoodies: 'Hoodies',
  Tshirt: 'T-shirt',
  Shorts: 'Shorts',
  Skirt: 'Skirt',
  Jeans: 'Jeans',
  Shoes: 'Shoes',
  Coat: 'Coat',
  Suit: 'Suit',
  Socks: 'Socks',
  Shirt: 'Shirt',
  Bra: 'Bra',
  Scarf: 'Scarf',
  Swimsuit: 'Swimsuit',
  Hat: 'Hat',
  Gloves: 'Gloves',
  Jacket: 'Jacket',
  Sunglasses: 'Sunglasses',
  Tie: 'Tie'
}

export type ConnectedDevice = {
  name: string;
  productId: number;
  vendorId: number;
}

export const ProductTypeList = (): string[] => {
  return Object.values(ProductType);
}

export const ClothesSize = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'
]

export const ShoeSize = Array.from(Array(50).keys()).slice(20, 49);


export const ShoeSizes = (): number[] => {
  let sizes = [];
  for (let i = 20; i <= 50; i++) {
    sizes.push(i);
  }

  return sizes;
}

export const FB_PATH = {
  SNIFS: 'snifs',
  TEMPLATES: 'templates',
  TAGS: 'tags',
}
export function getSnifPath(snifId: string) {
  return `${FB_PATH.SNIFS}/${snifId}`;
}

export function getTagPath(snifId: string): string {
  return `${getSnifPath(snifId)}/${FB_PATH.TAGS}`
}

export function getTemplates(snifId: string) {
  return `${getSnifPath(snifId)}/${FB_PATH.TEMPLATES}`
}


export const DEVICE_TYPES = {
  BURNER: 'BURNER',
  CASHIER: 'ANTI_THEFT',
}

export type DeviceMap = {
  BURNER: IDevice,
  CASHIER: IDevice
}

export const UserRole = {
  admin: 'admin',
  cashier: 'cashier',
  theftSpy: 'Theft Spy'
}

export function getTemplatePath(snifId: number, barCode: number): string {
  return `${FB_PATH.SNIFS}/${snifId}/${FB_PATH.TEMPLATES}/${barCode}`
}



export enum COM_STATUS {
  ATTACHED = 'Attached',
  CONNECTED = 'Connected',
  DATA_RECEIVED = 'Data Received',
  DATA_BURNED = 'Data Encoded',
  DETACHED = 'Detached',
  STARTED = 'Started',
  NOT_STARTED = 'Not Started',
  DISCONNECTED = 'Disconnected',
  SUCCESS = 'Success',
  NOK = 'There was an error encoding the tag',
  PENDING = 'Pending',
  ENCODING = 'Encoding',
  READING = 'Reading',
  NO_TRANSACTION = 'Waiting for new tag encoding',
  TRANSACTION_SUCCESSFULL = 'Encoding successfull',
  NO_RESPONSE = 'No Response'
}

export type DeviceStatus = {
  encodeur: string;
  transaction: string;
}


export class TagStat {
  lastRead: string | any;
  toEncode: string | any;
  canRead: boolean;
  canEncode: boolean;
  encoding: boolean;
  canUpdateDB: boolean;
  uiMessage: string | any;

  constructor() {
    this.lastRead = null;
    this.toEncode = null;
    this.canRead = false;
    this.encoding = false;
    this.canEncode = false;
    this.canUpdateDB = false;
    this.uiMessage = 'No pending encoding';
  }
}


export class CashierState {
  keepReading: boolean;
  // devient true quand le reset du tag a bien eu lieu
  canUpdateDB: boolean;
  tagId: string;
  product: Partial<ProductTemplate>;
  message: string;
  constructor() {
    this.tagId = '';
    this.keepReading = true;
    this.canUpdateDB = false;
    this.product = {};
    this.message = 'Waiting for a tag';
  }
}


export class AntitheftState {
  stolenTag = '';
  message = 'No Tag Detected Yet';
  sendNotification = false;
  keepReading = true;
  product: Partial<ProductTemplate> = {};
  constructor() {
  }
}
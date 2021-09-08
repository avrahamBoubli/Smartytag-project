import { DeviceEventEmitter } from "react-native";
import { RNSerialport, definitions, actions } from "react-native-serialport";
import { getCashierState, tagStat$, updateAntitheftState, updateCashierState, updateEncodeurStatus, updateTagStat } from "./state";
import { Parser } from "./parser.utils";
// @ts-ignore
import SoundPlayer from 'react-native-sound-player'
import { AntitheftState, CashierState, COM_STATUS, TagStat } from "../assets/types";
import { appScope } from "../App";

const parser = new Parser();
export class USBService {

  private readonly BAUD_RATE = 115200;
  // cashier variables
  isCashierMode = false;
  isConnected = false;
  // TheftSpyMode variables
  isTheftSpyMode = false;
  theftSpyKeepReading = true;


  commands = {
    emptyTagCommand: `3F0702${parser.emptyTagMarker}3A`,
    readTag: '3F01033D',
    firmwareVersion: '3F01013F'
  }


  constructor() {
  }

  async initEncodeur() {
    DeviceEventEmitter.addListener(actions.ON_CONNECTED, () => {
      updateEncodeurStatus({ encodeur: COM_STATUS.CONNECTED });
      this.isConnected = true;
      this.askFirmwareVersion();
    });
    DeviceEventEmitter.addListener(actions.ON_DISCONNECTED, () => {
      this.isConnected = false;
      updateEncodeurStatus({ encodeur: COM_STATUS.DISCONNECTED });
    });
    DeviceEventEmitter.addListener(actions.ON_READ_DATA, (data) => this.handlePayload(data));

    RNSerialport.setReturnedDataType(definitions.RETURNED_DATA_TYPES.HEXSTRING as any);
    RNSerialport.setDataBit(8);
    RNSerialport.setAutoConnectBaudRate(this.BAUD_RATE);
    RNSerialport.setAutoConnect(true);
    RNSerialport.startUsbService();
  };

  readTag() {
    updateTagStat({ uiMessage: 'Reading Tag' });
    RNSerialport.writeHexString(this.commands.readTag);
  }

  stopUsbListener() {
    DeviceEventEmitter.removeAllListeners();
    this.disconnect();
    RNSerialport.stopUsbService();
  }

  private disconnect() {
    try {
      RNSerialport.disconnect();
    } catch (e) {
      console.log(e)
    }
  }

  private async handlePayload({ payload }: any) {
    if (payload) {
      if (this.isTheftSpyMode) {
        this.handleTheftSpyPayload(payload);
      }
      if (this.isCashierMode) {
        this.handleCashierPayload(payload);
      } else {
        // encoding mode
        this.handleEncodingModePayload(payload);
      }
    }
  }

  private async handleTheftSpyPayload(payload: string) {
    const { firebase } = appScope;
    const tagId = parser.getId(payload);
    updateAntitheftState({ message: `Got Payload: ${payload}` });
    if (parser.isValidReading(payload)) {
      // on a choppe un vrai tag, on arrete de lire
      updateAntitheftState({ keepReading: false });
      const isRealTheft = parser.isValidStolenTag(tagId);
      const normalizedtagId = parser.normalizeStolenTag(tagId);
      const tag = await (await firebase.getTag(normalizedtagId).get()).data();

      let product: any = {};
      // getting the matching tag
      if (tag && tag.barCode) {
        if (isRealTheft) {
          // send notification
          appScope.firebase.addAlert(tag.barCode);
        }
        product = await (await firebase.getTemplate(`${tag.barCode}`).get()).data();
      }

      updateAntitheftState({
        product,
        message: isRealTheft ? `Tag ${tagId} is stolen, a notification has been dispatched` : 'All Good, (code 00)',
        stolenTag: normalizedtagId
      });
      // apres 7 secondes on reset le state, comme ca on reprendra la lecture
      setTimeout(() => updateAntitheftState({ keepReading: true }), 3000);
    }
  }


  debugTheftSpy() {
    const ids = ['3F070301471142660D44'];
    ids.forEach(id => this.handleTheftSpyPayload(id))
  }

  private async handleCashierPayload(payload: string) {
    // we are treating a tag, stop reading for some time
    if (parser.isValidReading(payload) && parser.isEncoded(payload)) {
      const tagId = parser.getId(payload);
      const product = await appScope.firebase.getTagTemplate(tagId);
      // on arrete de lire le tag, on affiche le produit quon vient de scanner, puis on attend 700 ms pr resetter le tag
      updateCashierState({ tagId: parser.getId(payload), keepReading: false, product });
      setTimeout(() => this.resetTag(), 700);
    } else if (parser.isValidWritingResponse(payload)) {
      // on a reussi a reset le tag
      this.beep();
      updateCashierState({ message: 'Successfully reset the tag, now updating DB' });
      await appScope.firebase.resetTag(getCashierState('tagId'));
      updateCashierState({ message: 'all done' });
      // apres 1 seconde on reprend la lecture
      setTimeout(() => updateCashierState(new CashierState()), 1000);
    }
    else if (parser.isEmpty(payload)) {
      updateCashierState({ message: 'This product has already been scannned' });
    }
  }

  private handleEncodingModePayload(payload: string) {
    // encoding mode
    const { canRead, encoding } = tagStat$.getValue();
    if (parser.isValidReading(payload) && canRead) {
      //WE HAVE READ SOMETHING
      updateTagStat({
        lastRead: parser.getId(payload),
        canRead: false,
        canEncode: true,
        uiMessage: 'Tag read !',
      });

    } else if (parser.isValidWritingResponse(payload) && encoding) {
      // successfull encoding, we can now update the DB
      updateTagStat({
        canEncode: false, canUpdateDB: true, canRead: false,
        uiMessage: 'Tag Encoded', encoding: false
      });
    }
  }

  private resetTag() {
    // rewrite the tag to reset it
    RNSerialport.writeHexString(this.commands.emptyTagCommand);
    // deletes from firestore the tag
    updateCashierState({ message: 'sent command to reset tag' })
  }

  encodeTag(id: string) {
    let baseCode = `3F0702${id}`;
    // includes the LCR    
    const tagFinalCode = `${baseCode}${parser.getLCR(baseCode)}`;
    RNSerialport.writeHexString(tagFinalCode);
    updateTagStat({ uiMessage: `Encoded ${tagFinalCode}` });
  }

  encodeTagInLoop() {
    // first encoding
    const id = parser.createId();
    updateTagStat({ encoding: true, toEncode: id });
    this.encodeTag(id);

    let i = 1;
    // tant que j'ai pas reussi a encode je re-essai
    const maxTrial = 5;

    const interval = setInterval(() => {

      const { canUpdateDB, encoding, canRead } = tagStat$.getValue();

      if (canUpdateDB) {
        // we are done
        clearInterval(interval);
      }

      const failedEncoding = !canUpdateDB && encoding && canRead;

      const keepEncoding = i <= maxTrial && !canUpdateDB;

      if (keepEncoding) {

        this.encodeTag(id);
        const message = i === 1 ? 'first attempt' : `${i} attempts`;
        updateTagStat({ uiMessage: `Trying to encode (${message}), ID: ${id}` });


      } else if (i === maxTrial && failedEncoding) {
        // reset the tag state, we are starting over
        updateTagStat({
          ...new TagStat(),
          canRead: true,
          uiMessage: 'Encoding timeout! try again (re-select a template)'
        });
        clearInterval(interval);
      }
      i++;
    }, 3500);
  }

  askFirmwareVersion() {
    RNSerialport.writeHexString('');
  }

  beep() {
    try {
      SoundPlayer.playSoundFile('beep', 'mp3')
    } catch (e) {
      console.log(`cannot play the sound file`, e)
    }
  }

  alert() {
    try {
      SoundPlayer.playSoundFile('alert', 'mp3')
    } catch (e) {
      console.log(`cannot play the sound file`, e)
    }
  }
}





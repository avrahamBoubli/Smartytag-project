import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@ui-kitten/components';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { TemplateList } from '../components/TemplateList';
import { COM_STATUS, DeviceStatus, ProductTemplate, TagStat } from '../assets/types';
import { Spinner } from '@ui-kitten/components';
import { encodeurStatus$, tagStat$, templates$, updateTagStat } from '../state/state';
import { Parser } from '../state/parser.utils';
import { interval } from 'rxjs';
import { blueColor, dangerColor, greyColor, rowSpaceBetween, successColor, textBlack, textBold } from '../style';
import * as Progress from 'react-native-progress';
import { ExistingTag } from '../components/ExistingTag';
import { appScope } from '../App';
import { distinctUntilChanged } from 'rxjs/operators';

const parser = new Parser();





/**
 * Serial Port communication protocol
 * in this component, we first make sure we are connector to the burner by:
 *  - checking our local storage
 *  - if we have a burner in the local storage, try to connect to it.
 *  - if error, show a message to connect to it.
 *  - Once we click on burn, we first do sayHi to the tag, then we burn it with the new id and associated barCode.
 *  once this is done, we save the object on the database
 * @param props 
 */
function EncodeurScreen(props: any) {


  const [templates, setTemplates] = useState<ProductTemplate[]>();
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ProductTemplate>();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(encodeurStatus$.value);
  const [showAlert, setShowAlert] = useState(false);
  const [skipOverrideAlert, setSkipOverrideAlert] = useState(false);
  const [uiMessage, setUiMessage] = useState<any>(null);

  useEffect(() => {

    let mounted = true;
    let interval$: any;
    let deviceStatus$: any;
    let tagStatSub$: any;
    let temps$: any;

    // for safety
    appScope.USB.isCashierMode = false;
    appScope.USB.askFirmwareVersion();


    temps$ = templates$.subscribe((data) => setTemplates(data));

    deviceStatus$ = encodeurStatus$.subscribe(status => {
      if (!showTemplateBuilder && mounted) {
        setDeviceStatus(status);
      }
    })

    interval$ = interval(1200)
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        const { encoding } = tagStat$.getValue();
        const canRead = tagStat$.getValue().canRead
          && mounted && !!activeTemplate && !encoding;
        if (canRead) {
          appScope.USB.readTag();
        }
      })

    tagStatSub$ = tagStat$
      .subscribe(async (data) => {
        if (!!activeTemplate) {
          const { lastRead, toEncode, canEncode, canUpdateDB, canRead, encoding } = tagStat$.getValue();
          setUiMessage(data.uiMessage);
          if (!canRead && lastRead) {
            // on a lu un tag, maintenant on l'encode
            const isEncodedTag = parser.isEncoded(lastRead);
            // on encode le tag, tant qu'on a pas reussi, on rentre ici
            if (canEncode && !encoding && !canUpdateDB) {
              //isEncodedTag
              if (isEncodedTag) {
                // est ce que on montre le dialog override
                skipOverrideAlert ? encodeTag() : setShowAlert(true);
              } else {
                // va encoder en loop toutes les 2 secondes le tag tant qu'il n'a pas reussi
                encodeTag();
              }
            }
            // on a encode un tag, maintenant on le sauvegarde sur la BD
            else if (canUpdateDB) {

              appScope.USB.beep();

              if (isEncodedTag) {
                // delete the old tag
                await appScope.firebase.resetTag(lastRead, false);
              }
              // save tag on firebase 
              const tagBarCode = activeTemplate?.barCode as any;
              // on attend la sauvegarde du tag sur la bd
              await appScope.firebase.saveTag(toEncode, tagBarCode);

              await appScope.firebase.getTemplates();

              // reset all the flags
              setTimeout(() => updateTagStat({ ...new TagStat(), canRead: true }), 3000);
            }
          }
        }
      })

    return () => {
      mounted = false;
      temps$ && temps$.unsubscribe();
      interval$ && interval$.unsubscribe();
      tagStatSub$ && tagStatSub$.unsubscribe();
      deviceStatus$ && deviceStatus$.unsubscribe();
    }
  }, [activeTemplate, showAlert])



  const dismissTemplateCreation = () => {
    setShowTemplateBuilder(false);
    updateTagStat(new TagStat());
  }

  const onTemplateSaved = () => {
    setShowTemplateBuilder(false);
  }

  const templateEditor = () => {
    return (
      <TemplateBuilder onComplete={() => onTemplateSaved()} onAboart={() => dismissTemplateCreation()} />
    )
  }

  const Status = () => {

    const progressColor = !tagStat$.getValue().canRead || !activeTemplate ? greyColor : 'orange';
    const encodeurConnected = deviceStatus.encodeur === COM_STATUS.CONNECTED;
    const iconColor = encodeurConnected ? successColor : dangerColor;
    const iconName = encodeurConnected ? 'checkmark' : 'alert-circle-outline';

    return (
      <View style={styles.statusContainer}>
        <View style={[styles.stat]}>
          <Text style={styles.statTxt}>Encodeur:</Text>
          <View style={styles.row}>
            <Icon fill={iconColor} name={iconName} style={{ width: 20, height: 20 }} />
            <Text style={{ ...textBold, color: iconColor }}>{deviceStatus.encodeur}</Text>
          </View>
        </View>
        <View style={[styles.stat]}>
          <Text style={styles.statTxt}>Encoding Status:</Text>
          <Text style={{ ...textBold, color: 'orange' }}>{uiMessage}</Text>
          <Progress.Bar width={100} indeterminate={true} color={progressColor} style={{ marginTop: 10 }} />
        </View>
      </View>
    )
  }




  const encodeTag = () => {
    if (showAlert) {
      setShowAlert(false);
    }
    if (!skipOverrideAlert) {
      setSkipOverrideAlert(true);
    }

    appScope.USB.encodeTagInLoop();
  }


  const createTemplate = () => {
    setShowTemplateBuilder(true);
    updateTagStat(new TagStat());
    setActiveTemplate(null as any);
  }

  const AddTemplate = () => {
    return (
      <View style={styles.addTemplate}>
        <Text style={styles.addTplTxt}>Add Template</Text>
        <TouchableOpacity style={styles.addTplBtn} onPress={() => createTemplate()}>
          <Icon fill='white' name='plus' style={styles.addBtn} />
        </TouchableOpacity>
      </View>
    )
  }


  const templateList = () => {

    const deleteTemplate = ({ barCode }: ProductTemplate) => {
      appScope.firebase.deleteTemplate(barCode as any).then(() => {
        // remove template from list locally;
        const tmpl = (templates$.value as any[]).filter(t => t.barCode !== barCode);
        templates$.next(tmpl);
      });
    }

    const selectTemplate = (template: ProductTemplate) => {
      const tag = !!template ? { ...new TagStat(), canRead: true } : new TagStat();
      updateTagStat(tag);
      setSkipOverrideAlert(false);
      setActiveTemplate(template);
      // reset tag stats, si pas de template, on arrete le mode lecture
    }

    const cancelOverride = () => {
      setShowAlert(false);
      updateTagStat(new TagStat());
    }



    return (

      <View>
        <Status />

        {showAlert === true && tagStat$.getValue().lastRead &&
          <ExistingTag tagId={tagStat$.getValue().lastRead}
            onOverride={encodeTag} onCancel={() => cancelOverride()} />
        }

        <AddTemplate />

        <TemplateList templates={templates as ProductTemplate[]}
          onSelect={(template: ProductTemplate) => selectTemplate(template)}
          onDelete={(template: ProductTemplate) => deleteTemplate(template)}
          activeTemplateCodeBar={activeTemplate?.barCode}
        />
      </View>
    )
  }

  const showTemplateList = !showTemplateBuilder && !!templates;


  const RenderElement = () => {
    if (showTemplateBuilder) {
      return templateEditor();
    } else if (showTemplateList) {
      return templateList();
    } else {
      return <Spinner size='giant' />
    }
  }

  return (
    <View style={styles.container}>
      <RenderElement />
    </View>
  );
};

export default EncodeurScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch'
  },
  burnTagBtn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  terminal: {
    backgroundColor: 'black',
    height: 300,
    padding: 10,
    display: 'flex', alignSelf: 'stretch',
    color: 'green', borderRadius: 10
  },
  addTemplate: {
    ...rowSpaceBetween as any,
    backgroundColor: 'white',
    borderRadius: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 10,
    paddingVertical: 5, marginVertical: 15
  },
  log: {
    backgroundColor: 'black',
    borderRadius: 10,
  },
  addTplBtn: {
    borderRadius: 100,
    backgroundColor: blueColor, height: 40, width: 40,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'

  },
  addTplTxt: {
    color: blueColor, fontWeight: 'bold'
  },
  stat: {
    backgroundColor: '#F6F6F6',
    height: 90,
    width: '48%',
    padding: 20,
    borderRadius: 15
  },
  addBtn: {
    height: 20, width: 20
  },
  statTxt: {
    ...textBold, ...textBlack
  },
  connected: {
    color: successColor, ...textBold
  },
  statusContainer: {
    display: 'flex', flexDirection: 'row', justifyContent: 'space-between'
  }

});



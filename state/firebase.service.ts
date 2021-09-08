import firestore from '@react-native-firebase/firestore';
import { ProductTemplate } from '../assets/types';
import { alerts$, snifData$, snifId$, snifMetadata$, tags$, templates$, updateTagStat } from './state';



export class FirebaseService {
  private readonly paths = {
    snifs: 'snifs',
    templates: 'templates',
    tags: 'tags',
    alerts: 'alerts'
  }

  constructor() {
  }

  private getSnifRef(): string {
    return `${this.paths.snifs}/${snifId$.value}`;
  }


  async getCollection(collection: string) {
    const ref = (await firestore().collection(`${this.getSnifRef()}/${collection}`).get());
    return (await ref).docs.map(document => document.data());
  }

  async getTemplates() {
    const templates = await this.getCollection(this.paths.templates);
    templates$.next(templates as any);

    return templates;
  }

  async getSnifTemplates(snifId: any) {
    const ref = (await firestore().collection(`${this.paths.snifs}/${snifId}/${this.paths.templates}`).get());
    return await ((await ref).docs).map(t => t.data());
  }

  async getTags() {
    const tags = await (await this.getCollection(this.paths.tags)).map(t => ({ ...t, id: t.id }));
    tags$.next(tags as any);
    return tags;
  }

  async getSnifMetadata<T>(id = null, saveInStore = true) {
    const docRef = id ? `${this.paths.snifs}/${id}` : this.getSnifRef();
    const snif = await (await firestore().doc(docRef).get()).data();
    if (saveInStore) {
      snifMetadata$.next(snif);
    }
    return snif;
  }

  async getAlerts() {
    const alerts = await this.getCollection(this.paths.alerts);
    alerts$.next(alerts as any);
    return alerts;
  }


  async getSnif() {
    const templates = await this.getTemplates();
    const snif = await this.getSnifMetadata();
    snifData$.next(snif as any);

    return { templates, snif };
  }


  addAlert(tagId: string) {
    firestore().collection(`${this.getSnifRef()}/${this.paths.alerts}`)
      .add({ barCode: tagId, time: new Date().getTime() })
  }

  getTag(tagId: string) {
    return firestore().collection(this.tagPath()).doc(tagId);
  }

  getTemplate(barCode: string) {
    return firestore().collection(this.templatePath()).doc(barCode);
  }

  tagPath(): string {
    return `${this.getSnifRef()}/${this.paths.tags}`;
  }

  templatePath(): string {
    return `${this.getSnifRef()}/${this.paths.templates}`;
  }

  async saveTag(tagId: string, barCode: number): Promise<any> {
    await firestore().collection(this.tagPath()).doc(tagId).set({
      lastUsed: Date.now(),
      barCode: `${barCode}`
    });
    const tag = await this.getTag(tagId).get();
    const data = tag.data();
    if (data && data.barCode) {
      return this.getTemplate(`${barCode}`)
        .update({ inStock: firestore.FieldValue.increment(1) });
    }
  }

  async deleteTag(id: string) {
    return firestore().collection(this.tagPath()).doc(id).delete();
  }

  saveTemplate(template: ProductTemplate) {
    return firestore()
      .doc(`${this.templatePath()}/${template.barCode}`)
      .set(template)
  }

  deleteTemplate(barCode: string) {
    return firestore()
      .doc(`${this.templatePath()}/${barCode}`).delete();
  }


  async resetTag(tagId: string, incrementSales = true) {
    const tag = await this.getTag(tagId).get();
    const data = tag.data();
    if (data && data.barCode) {
      const increment = incrementSales ? firestore.FieldValue.increment(1) : firestore.FieldValue;
      const decrement = firestore.FieldValue.increment(-1);
      // Update read count, need to cast as string otherwise it creates an error
      await this.getTemplate(`${data.barCode}`)
        .update({ soldUnits: increment, lastSold: new Date().getTime(), inStock: decrement });
      // delete the tag      
      return this.deleteTag(tagId);
    }
  }

  // on utilise ca dans le mode caisse uniquement
  async getTagTemplate(tagId: string) {
    const tag = await this.getTag(tagId).get();
    const data = tag.data();
    if (data && data.barCode) {
      const matchingTemplate = await (await this.getTemplate(`${data.barCode}`).get()).data();
      return matchingTemplate;
    }
  }
}


export function extractCollection(collection: any) {
  return collection.docs.map((document: any) => document.data());
}


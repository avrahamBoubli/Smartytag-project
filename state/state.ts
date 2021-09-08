import { BehaviorSubject } from 'rxjs';
import { AntitheftState, CashierState, COM_STATUS, DeviceStatus, ProductTemplate, Snif, TagReference, TagStat } from '../assets/types';
import { resetLocalStorage } from './storage';

const activeTemplate = new BehaviorSubject<ProductTemplate | null>(null);
export function setActiveTemplate(template: ProductTemplate | null) {
  activeTemplate.next(template);
}


export const tagStat$ = new BehaviorSubject<TagStat>(new TagStat());

export function updateTagStat(data: Partial<TagStat>) {
  const state: TagStat = Object.assign({}, tagStat$.getValue(), data);
  tagStat$.next(state);
}


export function updateTemplates(template: ProductTemplate) {
  templates$.next([...templates$.getValue(), template]);
}

export const snifId$ = new BehaviorSubject<string>('');

export const templates$ = new BehaviorSubject<ProductTemplate[]>([]);

export const tags$ = new BehaviorSubject<TagReference[]>([])

export const alerts$ = new BehaviorSubject<any[]>([]);

export const snifMetadata$ = new BehaviorSubject<any>(null);

export const userRole$ = new BehaviorSubject<string>(null as any);

export const dashboardData$ = new BehaviorSubject<Partial<Snif>[]>(null as any);

export const snifData$ = new BehaviorSubject<Partial<Snif>>({});

export const encodeurStatus$ = new BehaviorSubject<DeviceStatus>({
  encodeur: COM_STATUS.DISCONNECTED,
  transaction: COM_STATUS.NO_TRANSACTION
})

export function updateEncodeurStatus(status: Partial<DeviceStatus>) {
  const state = encodeurStatus$.value;
  encodeurStatus$.next({ ...state, ...status });
}

export const cashierState$ = new BehaviorSubject<CashierState>(new CashierState());

export function updateCashierState(state: Partial<CashierState>) {
  cashierState$.next({ ...cashierState$.getValue(), ...state });
}

export function getCashierState<T = string>(prop: keyof CashierState): T {
  return cashierState$.getValue()[prop] as T;
}

export const antiTheftState$ = new BehaviorSubject<AntitheftState>(new AntitheftState());
export function updateAntitheftState(state: Partial<AntitheftState>) {
  antiTheftState$.next({ ...antiTheftState$.value, ...state });
}

export function getAntiTheftState<T = string>(prop: keyof AntitheftState): T {
  return antiTheftState$.getValue()[prop] as T;
}



export function resetState() {
  const nil = null as any;
  updateTagStat(new TagStat());
  templates$.next([]);
  tags$.next([]);
  alerts$.next([]);
  snifMetadata$.next(nil);
  userRole$.next(nil);
  dashboardData$.next(nil);
  snifData$.next(nil);
  snifId$.next(null as any);
  encodeurStatus$.next({
    encodeur: COM_STATUS.DISCONNECTED,
    transaction: COM_STATUS.NO_TRANSACTION
  });
  cashierState$.next(new CashierState());
  antiTheftState$.next(new AntitheftState());
}

export function logout() {
  resetState();
  resetLocalStorage();
}
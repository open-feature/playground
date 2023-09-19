import { TourProps } from "@reactour/tour";
import { EventEmitter } from "eventemitter3";

export type Theme = { light: string, main: string, dark: string};
export type DemoPageProps = TourProps & { editorOn: boolean; tourOpen: boolean, jsonUpdated: EventEmitter };
export const JSON_UPDATED = 'json_updated';
export const DASHBOARD_GREY = '1f2937';

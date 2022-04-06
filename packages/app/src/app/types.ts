import { Context } from '@openfeature/openfeature-js';

export type Attributes = {
  userId: string;
  ip: string;
  method: string;
  path: string;
  platform: string;
};

export interface User {
  username: string;
}

export interface InstallTemplateData {
  os: string;
  installationInstruction: string;
}

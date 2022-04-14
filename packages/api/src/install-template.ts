import { IsString } from 'class-validator';
import { InstallTemplateData } from './types';

export class InstallTemplate implements InstallTemplateData {
  @IsString()
  os: string;

  @IsString()
  installationInstruction: string;

  constructor(data?: InstallTemplateData) {
    this.os = data?.os || 'Windows';
    this.installationInstruction =
      data?.installationInstruction || 'Download our .exe file.';
  }
}

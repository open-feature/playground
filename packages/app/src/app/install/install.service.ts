import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@openfeature/openfeature-js';
import { ClassValidatorHook } from '@openfeature/extra';
import { InstallTemplate } from './install-template';
import { OPENFEATURE_CLIENT, REQUEST_DATA } from '../constants';
import { Attributes, InstallTemplateData } from '../types';

@Injectable()
export class InstallService {
  constructor(
    @Inject(OPENFEATURE_CLIENT) private client: Client,
    @Inject(REQUEST_DATA) private attributes: Attributes
  ) {}

  async buildInstallMarkup() {
    const template = await this.client.getObjectValue<InstallTemplateData>(
      'installation-instructions',
      new InstallTemplate(),
      this.attributes,
      {
        hooks: [new ClassValidatorHook(InstallTemplate)],
      }
    );

    return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Killer app</title>
    </head>
    <body>
      <h1>Killer App</h1>
      <p>Thanks for your interest in our killer app!</p>
      <p>We see you're using ${template.os}. Please ${template.installationInstruction}</p>
    </body>
  </html>
  `;
  }
}

import { InstallTemplateData } from './types';

export const buildInstallMarkup = (template: InstallTemplateData) => {
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
};

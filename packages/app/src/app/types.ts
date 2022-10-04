export type RequestData = {
  targetingKey: string;
  ip: string;
  method: string;
  path: string;
  email?: string;
};

export type InstallTemplateData = {
  os: string;
  installationInstruction: string;
};

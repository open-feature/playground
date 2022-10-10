export type RequestData = {
  targetingKey: string;
  ip: string;
  method: string;
  path: string;
  userAgent?: string;
  email?: string;
};

export type InstallTemplateData = {
  os: string;
  installationInstruction: string;
};

export type ProjectModel = {
  uid: string;
  name: string;
  description?: string;
  defaultVersion: string;
  isDev?: boolean;
};

export type VersionModel = {
  project: string;
  name: string;
  description?: string;
  versionFallbacks: string[];
};

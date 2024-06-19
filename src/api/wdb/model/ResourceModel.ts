import type { ResourceContentType } from './ResourceInfo';

export type ResourceMeta = {
  uid: string;

  project: string;
  version: string;

  category: string;

  fullId: string;

  hash: string;
  contentType: ResourceContentType;

  name: string;
  description: string;
};

export type ResourceContent = {
  project: string;
  uid: string;
  hash: string;
  content: string;
  contentType: ResourceContentType;
};

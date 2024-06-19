import type { ResourceContentType } from '@/api/wdb/model/ResourceInfo';
import type { ResourceMeta } from '@/api/wdb/model/ResourceModel';

export type FolderItem = {
  id: string;
  title: string;
  children: (ResourceMeta | FolderItem)[];
};
export type ResourceModel = {
  uid?: string;
  project: string;
  category: string;
  fullId: string;
  name: string;
  description: string;
  content: string;
  contentType: ResourceContentType;
  version: string;
};

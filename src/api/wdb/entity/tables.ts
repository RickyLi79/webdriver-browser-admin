// type CollectionOptions<E> = Parameters<Loki['addCollection']>[1];

import type { ResourceContent, ResourceMeta } from '../model/ResourceModel';
import type { ProjectModel, VersionModel } from '../model/projectModel';

export const TABLE_NAME = {
  PROJECTS: 'projects',
  VERSIONS: 'versions',
  RESOURCE_META: 'resource-meta',
  RESOURCE_CONTENT: 'resource-content',
};
export const tables: Recordable<CollectionOptions<any>> = {
  [TABLE_NAME.PROJECTS]: {
    unique: ['uid'],
    indices: ['uid', 'isDev'],
    autoupdate: true,
    clone: true,
    disableMeta: true,
  } as CollectionOptions<ProjectModel>,
  [TABLE_NAME.VERSIONS]: {
    // unique: [],
    indices: ['project', 'name'],
    autoupdate: true,
    clone: true,
    disableMeta: true,
  } as CollectionOptions<VersionModel>,
  [TABLE_NAME.RESOURCE_META]: {
    unique: ['uid'],
    indices: ['project', 'version', 'category', 'fullId', 'id'],
    autoupdate: true,
    clone: true,
    disableMeta: true,
  } as CollectionOptions<ResourceMeta>,
  [TABLE_NAME.RESOURCE_CONTENT]: {
    unique: ['uid'],
    indices: ['project', 'uid'],
    autoupdate: true,
    clone: true,
    disableMeta: true,
  } as CollectionOptions<ResourceContent>,
};

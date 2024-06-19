import { hashCode } from '@/utils/hashUtils';
import type { BasicPageResult } from '../model/baseModel';
import type { ILokiApi } from './LokiInit';
import { TABLE_NAME } from './entity/tables';
import type { ResourceContent, ResourceMeta } from './model/ResourceModel';
import type { ResourcePack } from './model/ResourceInfo';

let lokiApi: ILokiApi;
let inited = false;
export function setupResourceApi(api: ILokiApi) {
  if (inited) return;
  inited = true;
  lokiApi = api;
}

const RESOURCE_ID_INVALID_REGEXP: RegExp[] = [/[./]{2,}/, /[?*|<>:"]/, /^\//, /[/.]$/];
function transformResourceId(id: string) {
  const re = id.replace(/\\/g, '/');
  const reg = RESOURCE_ID_INVALID_REGEXP.find((i) => i.test(re));
  if (reg) {
    throw new Error('resource id invalid: ' + reg.source);
  }
  return re;
}
export function getResourceFullId(category: string, id: string) {
  const re = category + ':' + transformResourceId(id);
  return re;
}

async function addResource(meta: Omit<ResourceMeta, 'uid' | 'hash'>, content: string) {
  const metaEntity: ResourceMeta = {
    ...meta,
    uid: crypto.randomUUID(),
    hash: hashCode(content),
    // id: meta.id,
    // fullId: getResourceFullId(meta.category, meta.id),
    fullId: meta.fullId,
  };
  const contentEntity: ResourceContent = {
    project: metaEntity.project,
    uid: metaEntity.uid,
    hash: metaEntity.hash,
    content,
    contentType: metaEntity.contentType,
  };
  const metaCol = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
  metaCol.insertOne(metaEntity);
  const contentCol = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
  contentCol.insertOne(contentEntity);
  return;
}

async function importResource({ meta, content }: ResourcePack) {
  const metaEntity: ResourceMeta = {
    uid: meta.uid,
    project: meta.project,
    version: meta.version,

    category: meta.category,

    fullId: meta.fullId,

    hash: meta.hash,
    contentType: meta.contentType,

    name: meta.name,
    description: meta.description,
  };
  const contentEntity: ResourceContent = {
    project: metaEntity.project,
    uid: metaEntity.uid,
    hash: metaEntity.hash,
    content,
    contentType: metaEntity.contentType,
  };
  {
    const metaCol = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
    const metaDoc = metaCol.findOne({ uid: meta.uid });
    if (!metaDoc) {
      metaCol.insertOne(metaEntity);
    } else {
      for (const i in metaEntity) {
        metaDoc[i] = metaEntity[i];
      }
      metaCol.update(metaDoc);
    }
  }

  {
    const contentCol = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
    const contentDoc = contentCol.findOne({ uid: meta.uid });
    if (!contentDoc) {
      contentCol.insertOne(contentEntity);
    } else {
      for (const i in contentEntity) {
        contentDoc[i] = contentEntity[i];
      }
      contentCol.update(contentDoc);
    }
  }
  return;
}

async function getResourceMetaByFullId({
  project,
  fullId,
  version,
}: {
  project: string;
  fullId: string;
  version: string;
}) {
  const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
  return lokiApi.lokiDocToRaw(col.findOne({ project, fullId, version }));
}
// async function getResourceMetaById({
//   project,
//   category,
//   id,
// }: {
//   project: string;
//   category: string;
//   id: string;
// }) {
//   const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
//   return lokiApi.lokiDocToRaw(col.findOne({ project, category, id }));
// }
async function getResourceMetaByUid(uid: string) {
  const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
  return lokiApi.lokiDocToRaw(col.findOne({ uid }));
}
async function getResourceContentByFullId(args: {
  project: string;
  fullId: string;
  version: string;
}) {
  const meta = await getResourceMetaByFullId(args);
  if (meta) {
    return await getResourceContentByUid(meta.uid);
  }
  return;
}
async function getResourceContentByUid(uid: string) {
  const col = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
  return lokiApi.lokiDocToRaw(col.findOne({ uid }));
}

async function updateResourceByUid(
  uid: string,
  {
    meta,
    content,
  }: {
    meta?: Partial<Pick<ResourceMeta, 'name' | 'description'>>;
    content?: string;
  },
) {
  let hash: string | undefined;
  if (content !== undefined) {
    const col = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
    const doc = col.by('uid', uid);
    if (doc) {
      doc.hash = hash = hashCode(content);
      doc.content = content;
      col.update(doc);
    }
  }

  if (meta) {
    const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
    const doc = col.by('uid', uid);
    if (doc) {
      for (const i in meta) {
        doc[i] = meta[i];
      }
      if (hash) {
        doc.hash = hash;
      }
      col.update(doc);
    }
  }
  return;
}

async function delResourceByUid(uid: string) {
  {
    const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
    col.findAndRemove({ uid });
  }
  {
    const col = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
    col.findAndRemove({ uid });
  }
  return;
}

async function getResourceMetaList({
  project,
  category,
  page,
  pageSize,
}: {
  project: string;
  category?: string;
  page: number;
  pageSize: number;
}) {
  const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
  let allRecords = col.chain().find({ project });
  if (category) {
    allRecords = allRecords.find({ category });
  }
  const total = allRecords.count();
  page = Math.ceil(Math.min(page * pageSize, total) / pageSize);
  page = Math.max(1, page);
  const records = allRecords
    .find()
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .data();
  const re: BasicPageResult<ResourceMeta> = {
    items: lokiApi.lokiDocToRawArr(records),
    page,
    pageSize,
    total: total,
  };
  return re;
}

export const wdbResourceApi = {
  addResource,
  getResourceMetaByFullId,
  // getResourceMetaById,
  getResourceMetaByUid,
  updateResourceByUid,
  delResourceByUid,
  getResourceMetaList,
  getResourceContentByFullId,
  getResourceContentByUid,
  transformResourceId,
  importResource,
};

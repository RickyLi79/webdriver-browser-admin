import { type ILokiApi } from '.';
import type { BasicPageResult } from '../model/baseModel';
import { genMockProject } from './entity/records.dev';
import { TABLE_NAME } from './entity/tables';
import type { ResourceContent, ResourceMeta } from './model/ResourceModel';
import type { ProjectModel, VersionModel } from './model/projectModel';

async function getProjectList({ page, pageSize }: { page: number; pageSize: number }) {
  const col = await lokiApi.getCollection<ProjectModel>(TABLE_NAME.PROJECTS);
  const allRecords = col.chain().find();
  const total = allRecords.count();
  page = Math.ceil(Math.min(page * pageSize, total) / pageSize);
  page = Math.max(1, page);
  const records = allRecords
    .find()
    .offset((page - 1) * pageSize)
    .limit(pageSize)
    .data();
  const re: BasicPageResult<ProjectModel> = {
    items: lokiApi.lokiDocToRawArr(records),
    page,
    pageSize,
    total: total,
  };
  return re;
}

function getRandomProjectInfo() {
  return genMockProject();
}
async function addMockProject() {
  const col = await lokiApi.getCollection<ProjectModel>(TABLE_NAME.PROJECTS);
  const doc = col.insertOne(genMockProject());
  return lokiApi.lokiDocToRaw(doc);
}

async function addProject(info: ProjectModel) {
  const col = await lokiApi.getCollection<ProjectModel>(TABLE_NAME.PROJECTS);
  info.uid || (info.uid = crypto.randomUUID());
  const doc = col.insertOne(info);
  return lokiApi.lokiDocToRaw(doc);
}
async function getProject(uid: string) {
  const col = await lokiApi.getCollection<ProjectModel>(TABLE_NAME.PROJECTS);
  const doc = col.findOne({ uid });
  return lokiApi.lokiDocToRaw(doc);
}
async function delProject(uid: string) {
  {
    const col = await lokiApi.getCollection<ProjectModel>(TABLE_NAME.PROJECTS);
    col.findAndRemove({ uid });
  }
  {
    const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
    col.findAndRemove({ project: uid });
  }
  {
    const col = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
    col.findAndRemove({ project: uid });
  }
  return;
}
async function updateProject(info: ProjectModel) {
  const col = await lokiApi.getCollection<ProjectModel>(TABLE_NAME.PROJECTS);
  const doc = col.findOne({ uid: info.uid });
  if (doc) {
    for (const i in info) {
      doc[i] = info[i];
    }
    col.update(doc);
  } else {
    throw new Error('project info not found');
  }
  return;
}

async function addVersion(info: VersionModel) {
  const col = await lokiApi.getCollection<VersionModel>(TABLE_NAME.VERSIONS);
  const doc = col.insertOne(info);
  return lokiApi.lokiDocToRaw(doc);
}

async function getVersion({ project, name }: { project: string; name: string }) {
  const col = await lokiApi.getCollection<VersionModel>(TABLE_NAME.VERSIONS);
  const doc = col.findOne({ project, name });
  return lokiApi.lokiDocToRaw(doc);
}
async function delVersion({ project, name }: { project: string; name: string }) {
  {
    const col = await lokiApi.getCollection<VersionModel>(TABLE_NAME.VERSIONS);
    col.findAndRemove({ project, name });
  }
  {
    const col = await lokiApi.getCollection<ResourceMeta>(TABLE_NAME.RESOURCE_META);
    const metaDoc = col.findOne({ project, version: name });
    if (metaDoc?.uid) {
      const col2 = await lokiApi.getCollection<ResourceContent>(TABLE_NAME.RESOURCE_CONTENT);
      col2.findAndRemove({ uid: metaDoc.uid });
      col.findAndRemove({ uid: metaDoc.uid });
    }
  }
  return;
}

async function updateVersion(info: VersionModel) {
  const col = await lokiApi.getCollection<VersionModel>(TABLE_NAME.VERSIONS);
  const doc = col.findOne({ project: info.project, name: info.name });
  if (doc) {
    for (const i in info) {
      doc[i] = info[i];
    }
    col.update(doc);
  } else {
    throw new Error('version info not found');
  }
  return;
}

let lokiApi: ILokiApi;
let inited = false;
export function setupProjectApi(api: ILokiApi) {
  if (inited) return;
  inited = true;
  lokiApi = api;
}
// setupWdbApi();

export const wdbProjectApi = {
  addMockProject,
  addProject,
  getProject,
  updateProject,
  delProject,
  getProjectList,
  getRandomProjectInfo,
  addVersion,
  getVersion,
  delVersion,
  updateVersion,
};

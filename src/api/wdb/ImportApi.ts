import { wdbProjectApi } from './ProjectApi';
import { wdbResourceApi } from './ResourceApi';
import type { ProjectVersionPack } from './model/ProjectPack';
import * as fflate from 'fflate';
import { type Zippable } from 'fflate';

function jsonToU8(obj: any) {
  return fflate.strToU8(JSON.stringify(obj, null, 2));
}

async function importProjectVersion({ projectInfo, versionInfo, resources }: ProjectVersionPack) {
  //#region ensure project
  let project = await wdbProjectApi.getProject(projectInfo.uid);
  if (!project) {
    project = await wdbProjectApi.addProject(projectInfo);
  } else {
    wdbProjectApi.updateProject(projectInfo);
  }
  //#endregion ensure project

  //#region ensure version
  const versionModel = {
    project: project!.uid,
    name: versionInfo.name,
    description: versionInfo.description,
    versionFallbacks: versionInfo.versionFallbacks,
  };
  let version = await wdbProjectApi.getVersion(versionModel);
  if (!version) {
    version = await wdbProjectApi.addVersion(versionModel);
  } else {
    wdbProjectApi.updateVersion(versionModel);
  }
  //#endregion ensure version

  //#region add resources
  for (const iResource of resources) {
    await wdbResourceApi.importResource(iResource);
  }
  //#endregion add resources
}

async function exportProjectVersion({
  projectUid,
  versionNames,
}: {
  projectUid: string;
  versionNames: string[];
}) {
  const project = await wdbProjectApi.getProject(projectUid);
  if (!project) return;
  const fflateData: Zippable = {};
  const projectData = (fflateData[`PJ-${project.name}`] = {
    'project.info.json': jsonToU8(project),
  });

  for (const iVerName of versionNames) {
    const version = await wdbProjectApi.getVersion({ project: projectUid, name: iVerName });
    if (!version) return;
    const versionData = (projectData[`VER-${version.name}`] = {
      resource: {},
      'version.info.json': jsonToU8(version),
    });
    const resourceMetas = await wdbResourceApi.getResourceMetaList({
      project: project.uid,
      page: 0,
      pageSize: 9e9,
    });
    const resourceData = (versionData.resource = {});
    for (const iResourceMeta of resourceMetas.items) {
      const resourceContent = await wdbResourceApi.getResourceContentByUid(iResourceMeta.uid);
      resourceData[iResourceMeta.name] = {
        'meta.json': jsonToU8(iResourceMeta),
        'content.json': jsonToU8(resourceContent),
      };
    }
  }

  return fflate.zipSync(fflateData);
}

export const wdbImportApi = {
  importProjectVersion,
  exportProjectVersion,
};

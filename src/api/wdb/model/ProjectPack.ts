import type { ProjectInfoFull } from './ProjectInfo';
import type { ResourcePack } from './ResourceInfo';
import type { VersionInfoFull } from './VersionInfo';

export type ProjectVersionPack = {
  projectInfo: ProjectInfoFull;
  versionInfo: VersionInfoFull;
  resources: ResourcePack[];
};

import type { DomDriverModel } from '../model/domDriverModel';
import type { ProjectModel } from '../model/projectModel';

import MockJs from 'mockjs';
import { TABLE_NAME } from './tables';

const mockTpl = {
  project: {
    id: '@guid',
    name: '#@increment @title(1,3)',
    description: '@sentence',
    isDev: true,
    tags: [{ type: 'warning', value: 'isDev' }],
  },
  domDrivers: {
    id: '@guid',
    name: '#@increment @title(1,3)',
    description: '@sentence',
    isDev: true,
    tags: [{ type: 'warning', value: 'isDev' }],
  },
};

export function genMockProject() {
  return MockJs.mock(mockTpl.project) as ProjectModel;
}

export function genMockDomDriver(projectId: string) {
  return MockJs.mock({
    ...mockTpl.domDrivers,
    projectId,
  }) as DomDriverModel;
}

export function getDevRecords(): Recordable<any[]> {
  const projects = MockJs.mock({
    'datas|10-30': [mockTpl.project],
  }).datas as ProjectModel[];

  const domDrivers = projects.reduce((result, iProject) => {
    const iDomDrivers: DomDriverModel[] = MockJs.mock({
      'datas|10-30': [
        {
          ...mockTpl.domDrivers,
          projectId: iProject.id,
        },
      ],
    }).datas;
    result.push(...iDomDrivers);
    return result;
  }, [] as DomDriverModel[]);
  return {
    [TABLE_NAME.PROJECTS]: projects,
    [TABLE_NAME.DOM_DRIVERS]: domDrivers,
  };
}

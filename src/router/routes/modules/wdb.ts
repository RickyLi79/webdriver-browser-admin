import type { AppRouteModule } from '@/router/types';

import { LAYOUT } from '@/router/constant';
import { t } from '@/hooks/web/useI18n';

const about: AppRouteModule = {
  path: '/wdb',
  name: 'WebdriverBrowser',
  component: LAYOUT,
  redirect: '/wdb/domDrivers',
  meta: {
    // hideChildrenInMenu: true,
    icon: 'cil:baby-carriage',
    title: t('routes.webdriver-browser.projects'),
    orderNo: 30,
    // ignoreKeepAlive: false,
  },
  children: [
    {
      path: 'projects',
      name: 'WdbProjects',
      component: () => import('@/views/wdb/projects/index.vue'),
      meta: {
        title: t('routes.webdriver-browser.projects'),
        icon: 'cil:baby-carriage',
        // hideMenu: true,
        // ignoreKeepAlive: true,
        hideChildrenInMenu: true,
      },
      children: [
        {
          path: ':id',
          name: 'WdbProjectsDetail',
          component: () => import('@/views/wdb/projects/ProjectDetail.vue'),
          meta: {
            currentActiveMenu: '/wdb/projects',
            title: t('views.wdb.projects.projectInfoDetail'),
            hideMenu: true,
            dynamicLevel: 3,
            // ignoreKeepAlive: true,
          },
        },
      ],
    },
    {
      path: 'domDrivers',
      name: 'WdbDomDrivers',
      component: () => import('@/views/wdb/domDrivers/index.vue'),
      meta: {
        title: t('routes.webdriver-browser.domDrivers'),
        // hideMenu: true,
        // ignoreKeepAlive: true,
      },
    },
    {
      path: 'executeScript',
      name: 'executeScript',
      component: () => import('@/views/wdb/executeScript/index.vue'),
      meta: {
        title: t('routes.webdriver-browser.executeScript'),
        // hideMenu: true,
        // ignoreKeepAlive: true,
      },
    },
    {
      path: 'addRequest',
      name: 'addRequest',
      component: () => import('@/views/wdb/addRequest/index.vue'),
      meta: {
        title: t('routes.webdriver-browser.addRequest'),
        // hideMenu: true,
        // ignoreKeepAlive: true,
      },
    },
  ],
};

export default about;

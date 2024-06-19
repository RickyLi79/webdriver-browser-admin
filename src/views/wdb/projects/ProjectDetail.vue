<template>
  <ScrollContainer>
    <div ref="wrapperRef" :class="prefixCls">
      <Tabs tab-position="left" :tabBarStyle="tabBarStyle" v-if="unref(project)">
        <template v-for="item in tabs" :key="item.name">
          <TabPane :tab="item.name">
            <component v-if="item.component" :is="item.component" :project="project" />
          </TabPane>
        </template>
      </Tabs>
    </div>
  </ScrollContainer>
</template>

<script lang="ts" setup>
  import { wdbProjectApi } from '@/api/wdb';
  import { ProjectModel } from '@/api/wdb/model/projectModel';
  import { ScrollContainer } from '@/components/Container';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useTabs } from '@/hooks/web/useTabs';
  import { Tabs } from 'ant-design-vue';
  import { onMounted, ref, unref } from 'vue';
  import { useRoute } from 'vue-router';
  import BaseInfo from './BaseInfo.vue';
  import ResourceList from './resourceList/ResourceList.vue';

  defineOptions({ name: 'WdbProjectsDetail' });

  const { t } = useI18n();
  const { setTitle } = useTabs();
  const { createErrorModal } = useMessage();

  // const model = ref<{ project: ProjectModel; title: string }>();

  const project = ref<ProjectModel>();

  const route = useRoute();
  const projectId = route.params!.id as string;

  const TabPane = Tabs.TabPane;

  type TabItem = {
    name: string;
    component?: any;
  };
  const tabs: TabItem[] = [
    {
      name: t('views.wdb.projects.tabs.info'),
      component: BaseInfo,
    },
    {
      name: t('views.wdb.projects.tabs.template'),
      // component: '',
    },
    {
      name: t('views.wdb.projects.tabs.category'),
    },
    {
      name: t('views.wdb.projects.tabs.resources'),
      component: ResourceList,
    },
    {
      name: t('views.wdb.projects.tabs.tests'),
      // component: '',
    },
  ];

  const prefixCls = 'account-setting';
  const tabBarStyle = {
    width: '220px',
  };

  onMounted(async () => {
    const p = await wdbProjectApi.getProject(projectId);
    if (p) {
      project.value = p;
      // model.value = {
      //   project: p,
      //   title: p.name,
      // };
      setTitle(t('views.wdb.projects.tabName', [p.name]));
      return;
    }

    createErrorModal({
      content: t('views.wdb.projects.createNewProject'),
    });
  });
</script>
<style lang="less">
  .account-setting {
    margin: 12px;
    background-color: @component-background;

    .base-title {
      padding-left: 0;
    }

    .ant-tabs-tab-active {
      background-color: @item-active-bg;
    }
  }
</style>

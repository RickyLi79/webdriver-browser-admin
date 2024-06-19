<template>
  <PageWrapper :class="prefixCls">
    <template #headerContent>
      <Space>
        <Button v-dev-only @click="handleDropIdxDB">dropIdxDB</Button>
        <Button v-dev-only @click="devResetHandler">DEV Reset</Button>
        <Button v-dev-only @click="addMockProjectHandler()">Add Mock Project</Button>
        <Button v-dev-only @click="handleImportProject()">import</Button>
        <Button type="primary" @click="openModalCreateNewProjectHandler">{{
          t('views.wdb.projects.createNewProject')
        }}</Button>
      </Space>
    </template>

    <div :class="`${prefixCls}__content`">
      <Pagination v-bind="pagination" @change="paginationChange" />
      <List>
        <Row :gutter="16">
          <template v-for="item in projectList?.items" :key="item.title">
            <Col :span="6">
              <List.Item>
                <Card
                  :hoverable="true"
                  @click="openProjectDetailHandler(item)"
                  :class="`${prefixCls}__card`"
                  :title="item.name"
                >
                  {{ item.description }}
                  <template #extra>
                    <!-- <Tag
                      v-for="(iTag, idx) in item.tags"
                      :key="idx"
                      :color="getTagColor(iTag.type)"
                      >{{ iTag.value }}</Tag
                    > -->
                    <Tag v-if="item.isDev" color="error">isDev</Tag>
                    <a-button
                      shape="circle"
                      @click.prevent.stop="onProjectClickHandler(item)"
                      type="text"
                    >
                      <template #icon> <Icon icon="carbon:information" /></template>
                    </a-button>
                  </template>
                </Card>
              </List.Item>
            </Col>
          </template>
        </Row>
      </List>
    </div>

    <ProjectDetail
      @register="registerProjectDetail"
      @submit="onCreateNewProject"
      @del="getProjectListHandler({})"
      @update="getProjectListHandler({})"
    />

    <ImportProject @register="registerImportProject" @submit="onCreateNewProject" />
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { type BasicPageResult } from '@/api/model/baseModel';
  import { wdbLocalApi, wdbProjectApi } from '@/api/wdb';
  import { type ProjectModel } from '@/api/wdb/model/projectModel';
  import Icon from '@/components/Icon/Icon.vue';
  import { useModal } from '@/components/Modal';
  import { PageWrapper } from '@/components/Page';
  import { Space, Card, Col, List, Pagination, Row, Tag, Button } from 'ant-design-vue';
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import ProjectDetail, { ProjectInfoDetailModel } from './ProjectEdit.vue';
  import { useGo } from '@/hooks/web/usePage';
  import ImportProject from './ImportProject.vue';

  defineOptions({ name: 'WdbProjects' });
  const { t } = useI18n();
  const go = useGo();
  function openProjectDetailHandler(projectInfo: ProjectModel) {
    go(`/wdb/projects/${projectInfo.uid}`);
  }

  const projectList = ref<BasicPageResult<ProjectModel>>();

  const [registerProjectDetail, { openModal: openModalProjectDetail }] = useModal();
  function openModalCreateNewProjectHandler() {
    openModalProjectDetail<ProjectInfoDetailModel>(true, {
      mode: 'create',
    });
  }

  const prefixCls = 'list-card';
  const defaultPageSize = 20; // SHOULD set by config

  function paginationChange(page: number, pageSize: number) {
    getProjectListHandler({ page, pageSize });
  }
  async function getProjectListLast() {
    const { total, pageSize } = pagination.value;
    getProjectListHandler({ page: Math.ceil((total + 1) / pageSize) });
  }

  async function getProjectListHandler({
    page = pagination.value.current,
    pageSize = pagination.value.pageSize,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    projectList.value = await wdbProjectApi.getProjectList({ page, pageSize });
  }
  async function handleDropIdxDB() {
    await wdbLocalApi.dropIndexedDB();
  }
  async function devResetHandler() {
    await wdbLocalApi.resetDevRecords();

    getProjectListHandler({});
  }
  async function addMockProjectHandler() {
    await wdbProjectApi.addMockProject();
    getProjectListHandler({});
  }

  const [registerImportProject, { openModal: openImportProject }] = useModal();
  function handleImportProject() {
    openImportProject();
  }

  onMounted(() => {
    getProjectListHandler({});
  });

  const pagination = computed(() => {
    return {
      // show: true,
      pageSize: projectList.value?.pageSize ?? defaultPageSize,
      current: projectList.value?.page ?? 1,
      // size: 'small',
      total: projectList.value?.total ?? 0,

      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${total} items`,
      // position: 'both',
    };
  });

  function onProjectClickHandler(project: ProjectModel) {
    openModalProjectDetail<ProjectInfoDetailModel>(true, {
      mode: 'detail',
      projectInfo: project,
    });
  }
  function onCreateNewProject() {
    getProjectListLast();
  }
</script>
<style lang="less" scoped>
  .list-card {
    &__link {
      margin-top: 10px;
      font-size: 14px;

      a {
        margin-right: 30px;
      }

      span {
        margin-left: 5px;
      }
    }

    &__card {
      width: 100%;
      margin-bottom: -8px;

      .ant-card-body {
        padding: 16px;
      }

      &-title {
        margin-bottom: 5px;
        color: @text-color-base;
        font-size: 16px;
        font-weight: 500;

        .icon {
          margin-top: -5px;
          margin-right: 10px;
          font-size: 38px !important;
        }
      }

      &-detail {
        padding-top: 10px;
        padding-left: 30px;
        color: @text-color-secondary;
        font-size: 14px;
      }
    }
  }

  .full-modal {
    .ant-modal {
      top: 0;
      max-width: 100%;
      margin: 0;
      padding-bottom: 0;
    }

    .ant-modal-content {
      display: flex;
      flex-direction: column;
      height: calc(100vh);
    }

    .ant-modal-body {
      flex: 1;
    }
  }
</style>

<template>
  <CollapseContainer :title="props.project?.name" :canExpand="true">
    123 {{ props.project?.name }} 456 xxxx {{ props.project?.name }} 456
    <Description :column="1" :data="props.project" :schema="infoSchema" />
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { ProjectModel } from '@/api/wdb/model/projectModel';
  import { CollapseContainer } from '@/components/Container';

  import { Description, DescItem } from '@/components/Description';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineModel<{ project?: ProjectModel; title?: string }>({
    default: {},
  });

  const infoSchema: DescItem[] = [
    {
      field: 'name',
      label: t('views.wdb.projects.projectInfo.name'),
    },
    {
      field: 'description',
      label: t('views.wdb.projects.projectInfo.description'),
    },
    {
      field: 'isDev',
      label: t('views.wdb.projects.projectInfo.isDev'),
    },
  ];
</script>

<style lang="less" scoped>
  .change-avatar {
    img {
      display: block;
      margin-bottom: 15px;
      border-radius: 50%;
    }
  }
</style>

<template>
  <CollapseContainer :title="props.project.name" :canExpand="true">
    <BasicForm @register="formRegister" />
    <!-- <Description :column="1" :data="modelRef.project" :schema="infoSchema" /> -->
    <Button @click="handlerExport">export</Button>
  </CollapseContainer>
</template>
<script lang="ts" setup>
  import { ProjectModel } from '@/api/wdb/model/projectModel';
  import { CollapseContainer } from '@/components/Container';
  import { Button } from 'ant-design-vue';
  import { BasicForm, useForm } from '@/components/Form';
  import { onMounted, defineProps } from 'vue';
  import { projectFormSchema } from './ProjectFormSchema';
  import { wdbImportApi } from '@/api/wdb';
  import { downloadByData } from '@/utils/file/download';

  const props = defineProps({
    project: {
      type: Object as PropType<ProjectModel>,
      required: true,
    },
    // title: {
    //   type: String,
    //   required: true,
    // },
  });
  const [formRegister, { setFieldsValue }] = useForm({
    schemas: projectFormSchema({ readonly: true }),
    // labelWidth: 240,
    labelAlign: 'right',
    labelCol: { span: 8 },
    // autoFocusFirstItem: true,
    baseColProps: {
      span: 13,
    },
    showActionButtonGroup: false,
    readonly: true,
  });

  async function resetFunc() {
    props.project && setFieldsValue(props.project);
  }
  onMounted(() => {
    resetFunc();
  });

  async function handlerExport() {
    const buff = await wdbImportApi.exportProjectVersion({
      projectUid: props.project.uid,
      versionNames: ['my-ver', 'main'],
    });
    if (buff) {
      downloadByData(buff, `${props.project.name}.zip`);
    }
  }
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

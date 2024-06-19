<template>
  <BasicModal
    @register="modalRegister"
    v-bind="$attrs"
    width="1000px"
    :mask-closable="false"
    :keyboard="false"
    :destroy-on-close="true"
    :title="t('views.wdb.projects.importProjectVersion')"
  >
    <BasicForm @register="formRegister" />
    <template #footer>
      <BasicForm @register="sourceForm" />
      <a-button @click="handleClose">{{ t('common.cancelText') }}</a-button>
      <a-button type="primary" @click="handleSubmit">{{ t('common.submitText') }}</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { wdbImportApi } from '@/api/wdb';
  import { ProjectVersionPack } from '@/api/wdb/model/ProjectPack';
  import { BasicForm, useForm, type FormSchema } from '@/components/Form';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useMessage } from '@/hooks/web/useMessage';
  import { Space, Tag } from 'ant-design-vue';
  import { defineEmits, h, ref } from 'vue';

  const { t } = useI18n();

  const emit = defineEmits(['cancel', 'submit']);
  const { createMessage } = useMessage();

  const [modalRegister, { closeModal }] = useModalInner();

  const sourceFormSchema: FormSchema[] = [
    {
      field: 'source',
      component: 'InputTextArea',
      label: 'source',
    },
  ];

  const formSchema: FormSchema[] = [
    {
      field: 'divider-basic',
      component: 'Divider',
      label: t('views.wdb.projects.projectInfoDetail'),
      colProps: {
        span: 24,
      },
    },
    {
      field: 'projectInfo.uid',
      component: 'Input',
      label: 'uid',
    },
    {
      field: 'projectInfo.name',
      component: 'Input',
      label: 'name',
    },
    {
      field: 'projectInfo.description',
      component: 'InputTextArea',
      label: 'description',
    },
    {
      field: 'projectInfo.isDev',
      component: 'Switch',
      label: 'isDev',
    },
    {
      field: 'divider-basic',
      component: 'Divider',
      label: t('views.wdb.version.versionInfo'),
      colProps: {
        span: 24,
      },
    },
    {
      field: 'versionInfo.name',
      component: 'Input',
      label: 'name',
    },

    {
      field: 'versionInfo.description',
      component: 'InputTextArea',
      label: 'description',
    },
    {
      field: 'versionInfo.versionFallbacks',
      component: 'Input',
      label: 'versionFallbacks',
      render({ model, field }) {
        const list: string[] = model[field] ?? [];
        return h(
          Space,
          list.map((ver) => {
            return h(Tag, ver);
          }),
        );
      },
    },
  ];
  const modelRef = ref<ProjectVersionPack>();

  const [sourceForm, { getFieldsValue: sourceGetFieldsValue }] = useForm({
    schemas: sourceFormSchema,
    // labelWidth: 240,
    labelAlign: 'right',
    labelCol: { span: 8 },
    autoFocusFirstItem: true,
    baseColProps: {
      span: 13,
    },
    showActionButtonGroup: true,
    submitButtonOptions: {
      text: 'update',
    },
    submitFunc: async () => {
      const { source } = sourceGetFieldsValue() as { source: string };
      modelRef.value = JSON.parse(source);
    },
  });

  const [formRegister] = useForm({
    model: modelRef,
    schemas: formSchema,
    // labelWidth: 240,
    labelAlign: 'right',
    labelCol: { span: 8 },
    autoFocusFirstItem: false,
    baseColProps: {
      span: 13,
    },
    showActionButtonGroup: false,
  });

  async function handleSubmit() {
    try {
      const res: ProjectVersionPack = modelRef.value!;
      await wdbImportApi.importProjectVersion(res);
      createMessage.success(
        t('views.wdb.version.projectVersionImported', [res.projectInfo.name, res.versionInfo.name]),
      );
      emit('submit', res);
      closeModal();
    } catch (error) {
      createMessage.error(error.errorFields.map((i) => `${i.name} : ${i.errors}`));
    }
  }
  function handleClose() {
    closeModal();
    emit('cancel');
  }
</script>

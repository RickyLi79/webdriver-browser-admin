<template>
  <BasicModal
    @register="modalRegister"
    v-bind="$attrs"
    width="1000px"
    :mask-closable="false"
    :keyboard="false"
    :destroy-on-close="true"
  >
    <BasicForm @register="formRegister" />
    <template #footer>
      <template v-if="modelRef.mode === 'detail'">
        <a-button @click="handleClose">{{ t('common.closeText') }}</a-button>
        <a-button @click="handleDel" danger>{{ t('common.delText') }}</a-button>
        <a-button type="primary" @click="handleEdit">{{ t('common.editText') }}</a-button>
      </template>
      <template v-else-if="modelRef.mode === 'create'">
        <a-button v-dev-only @click="randomHandler" type="dashed" danger>Random</a-button>
        <Divider v-dev-only type="vertical" />
        <a-button @click="handleClose">{{ t('common.cancelText') }}</a-button>
        <a-button type="primary" @click="handleSubmit">{{ t('common.submitText') }}</a-button>
      </template>
      <template v-else-if="modelRef.mode === 'edit'">
        <a-button v-dev-only @click="randomHandler" type="dashed" danger>Random</a-button>
        <Divider v-dev-only type="vertical" />
        <a-button @click="handleClose">{{ t('common.cancelText') }}</a-button>
        <a-button type="primary" @click="handleUpdate">{{ t('common.updateText') }}</a-button>
      </template>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { wdbProjectApi } from '@/api/wdb';
  import { ProjectModel } from '@/api/wdb/model/projectModel';
  import { BasicForm, useForm } from '@/components/Form';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { Divider } from 'ant-design-vue';
  import { projectFormSchema } from './ProjectFormSchema';
  import { useMessage } from '@/hooks/web/useMessage';
  import { ref, computed, watch, defineEmits } from 'vue';
  import { isDevMode } from '@/utils/env';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();

  const emit = defineEmits(['register', 'cancel', 'submit', 'del', 'update']);

  const [modalRegister, { closeModal, setModalProps }] = useModalInner(
    (data?: ProjectInfoDetailModel) => {
      data && onDataReceive(data);
    },
  );

  export type ProjectInfoDetailModel = {
    mode: 'detail' | 'create' | 'edit';
    projectInfo?: ProjectModel;
  };
  const modelRef = ref<ProjectInfoDetailModel>({
    mode: 'detail',
  });

  watch(modelRef, () => {
    switch (modelRef.value.mode) {
      case 'detail':
        setModalProps({
          title: t('views.wdb.projects.projectInfoDetail'),
          maskClosable: true,
          keyboard: true,
        });
        break;
      case 'create':
        setModalProps({
          title: t('views.wdb.projects.createNewProject'),
          maskClosable: false,
          keyboard: false,
        });
        break;
      case 'edit':
        setModalProps({
          title: t('views.wdb.projects.projectInfoEdit'),
          maskClosable: false,
          keyboard: false,
        });
        break;
      default:
        break;
    }
  });

  function onDataReceive(data: ProjectInfoDetailModel) {
    modelRef.value = data;
    data.projectInfo && setFieldsValue(data.projectInfo);
  }

  const { createMessage, createConfirm } = useMessage();

  const [formRegister, { validateFields, setFieldsValue }] = useForm({
    schemas: projectFormSchema({}),
    // labelWidth: 240,
    labelAlign: 'right',
    labelCol: { span: 8 },
    autoFocusFirstItem: true,
    baseColProps: {
      span: 13,
    },
    showActionButtonGroup: false,
    disabled: computed(() => modelRef.value.mode === 'detail'),
  });

  function randomHandler() {
    const projectInfo = wdbProjectApi.getRandomProjectInfo();
    if (modelRef.value.projectInfo?.id) {
      projectInfo.id = modelRef.value.projectInfo.id;
    }
    setFieldsValue(projectInfo);
  }

  function handleEdit() {
    modelRef.value.mode = 'edit';
  }

  async function handleUpdate() {
    try {
      const res: ProjectModel = await validateFields();
      if (res.isDev) {
        res.tags = [{ type: 'warning', value: 'isDev' }];
      } else {
        res.tags = [];
      }
      res.id = modelRef.value.projectInfo!.id;
      await wdbProjectApi.updateProject(res);
      emit('update', res);
      closeModal();
    } catch (error) {
      console.log('not passing', error);
      createMessage.error(error.errorFields.map((i) => `${i.name} : ${i.errors}`));
    }
  }

  async function handleSubmit() {
    try {
      const res: ProjectModel = await validateFields();
      if (res.isDev) {
        res.tags = [{ type: 'warning', value: 'isDev' }];
      } else {
        res.tags = [];
      }
      await wdbProjectApi.addProject(res);
      createMessage.success(t('views.wdb.projects.projectInfoCreated', [res.name]));
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
  function handleDel(e: MouseEvent) {
    async function onOk() {
      await wdbProjectApi.delProject(modelRef.value.projectInfo!.id);
      createMessage.success(
        t('views.wdb.projects.projectInfoDeleted', {
          name: modelRef.value.projectInfo!.name,
        }),
      );
      closeModal();
      emit('del');
    }
    if (e.ctrlKey && isDevMode() && modelRef.value.projectInfo!.isDev) {
      onOk();
      return;
    }
    createConfirm({
      iconType: 'warning',
      content: t('views.wdb.projects.projectInfoDelConfirm', {
        name: modelRef.value.projectInfo!.name,
      }),
      onOk,
    });
  }
</script>

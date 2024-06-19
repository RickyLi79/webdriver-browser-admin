<template>
  <BasicModal
    destroyOnClose
    @register="modalRegister"
    title="Add Resource"
    @ok="handleSubmit"
    :okText="isEditMode ? 'Update' : 'Add'"
    @cancel="isEditMode = false"
  >
    <BasicForm :loading="loading" @register="formRegister" />
    <Space v-if="isEditMode">
      <Button @click="handleTest">test</Button>
    </Space>
  </BasicModal>
</template>

<script setup lang="ts">
  import { wdbResourceApi } from '@/api/wdb';
  import { Button } from '@/components/Button';
  import { BasicForm, useForm, type FormSchema } from '@/components/Form';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { useMessage } from '@/hooks/web/useMessage';
  import { wdbEditorSDK } from '@/wdbEditorSDK';
  import { Space } from 'ant-design-vue';
  import { computed, ref } from 'vue';
  import { type ResourceModel } from '../types';
  // import { loadAndRun } from '@/api/executeScript/src/entry';

  const [modalRegister, { closeModal }] = useModalInner((model: ResourceModel) => {
    isEditMode.value = model.uid !== undefined;
    if (model.uid) {
      wdbResourceApi
        .getResourceContentByUid(model.uid)
        .then((re) => {
          if (re) {
            orgContent = re.content;
            setFieldsValue({
              uid: model.uid,
              project: model.project,
              fullId: model.fullId,
              name: model.name,
              version: model.version,
              category: model.category,
              description: model.description,
              content: re.content,
            });
          }
        })
        .finally(() => {
          loading_content.value = false;
        });
    } else {
      setFieldsValue({
        project: model.project,
      }).then(() => {
        clearValidate();
      });
    }
  });

  const emits = defineEmits<{
    submit: [];
  }>();

  const loading_content = ref(true);
  const loading_add = ref(false);

  const loading = computed(() => {
    return loading_content.value && loading_add.value;
  });

  // const [model] = defineModel<ResourceModel>();

  const schemas: FormSchema[] = [
    {
      field: 'uid',
      component: 'Input',
      show: false,
    },
    {
      field: 'project',
      component: 'Input',
      show: false,
    },
    {
      field: 'category',
      component: 'RadioButtonGroup',
      label: 'Category',
      componentProps: {
        options: ['config', 'component', 'pageObject', 'testCase', 'others'],
      },
      defaultValue: 'config',
    },
    {
      field: 'fullId',
      component: 'Input',
      label: 'FullId',
      required: true,
      rules: [
        {
          validator(rule, value, callback) {
            wdbResourceApi.transformResourceId(value);
            callback();
          },
          trigger: 'change',
        },
      ],
    },
    {
      field: 'name',
      label: 'title',
      component: 'Input',
      required: true,
    },
    {
      field: 'description',
      label: 'description',
      component: 'Input',
      required: false,
    },
    {
      field: 'version',
      label: 'version',
      component: 'Input',
      defaultValue: 'main',
      required: true,
    },
    {
      field: 'content',
      label: 'content',
      component: 'InputTextArea',
      componentProps: {
        rows: 10,
      },
      colProps: {
        span: 20,
      },
      required: true,
    },
  ];
  const [formRegister, { getFieldsValue, validate, setFieldsValue, clearValidate }] = useForm({
    // model,
    labelWidth: 80,
    schemas,
    autoFocusFirstItem: true,
    actionColOptions: {
      span: 24,
    },
    showActionButtonGroup: false,
    baseColProps: { span: 16 },
  });

  const { createMessage } = useMessage();

  const isEditMode = ref(false);
  let orgContent: string = '';

  async function handleAdd(val: ResourceModel) {
    try {
      loading_add.value = true;
      if (!isEditMode.value) {
        await wdbResourceApi.addResource(
          {
            project: val.project,
            category: val.category,
            name: val.name,
            description: val.description,
            version: val.version,
            fullId: val.fullId,
            contentType: val.contentType,
          },
          val.content,
        );
        createMessage.success('successful added');
      } else {
        await wdbResourceApi.updateResourceByUid(val.uid!, {
          meta: {
            name: val.name,
            description: val.description,
          },
          content: orgContent === val.content ? undefined : val.content,
        });
        createMessage.success('successful updated');
      }
      emits('submit');
    } catch (err) {
      createMessage.error('failed to add : ' + (err as Error).message);
    } finally {
      loading_add.value = false;
    }
  }

  function handleSubmit() {
    validate()
      .then(() => {
        return handleAdd(getFieldsValue() as any);
      })
      .then(() => {
        // emits('submit', getFieldsValue() as any);
        isEditMode.value = false;
        closeModal();
      })
      .catch(() => {
        //
      });
  }

  async function handleTest() {
    const m = getFieldsValue() as ResourceModel;
    console.info(m);
    const a = await wdbEditorSDK.resourceRunner.loadAndRun(
      {
        project: m.project,
        fullId: m.fullId,
        version: [m.version],
      },
      {
        project: m.project,
        fullId: 'default/test-res',
        version: ['no-such-ver', 'my-ver', 'main'],
      },
      {
        data: 3.2,
      },
      {
        data: 5.1,
      },
    );
    console.info(a);
  }
</script>

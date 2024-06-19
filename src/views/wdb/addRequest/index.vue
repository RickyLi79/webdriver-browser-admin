<template>
  <h1>{{ computedQuery }}</h1>
  <BasicForm v-loading="loading" @register="formRegister" @submit="handleSubmit" />

  <Button @click="handleSendRequest">RQ send request</Button>
  <Switch v-model:checked="watchRequest">RQ watch</Switch>
  <Table :columns="requestColumns" :data-source="requestData">
    <template #action="{ record }">
      <Space>
        <a @click="responseRQ(record, RQResponseStatus.OK)">200</a>
        <a-divider type="vertical" />
        <a @click="responseRQ(record, RQResponseStatus.NOT_FOUND)">404</a>
        <a-divider type="vertical" />
      </Space>
    </template>
  </Table>
</template>

<script setup lang="ts">
  import { Button } from '@/components/Button';
  import { BasicForm, FormSchema, useForm } from '@/components/Form';
  import { useMessage } from '@/hooks/web/useMessage';
  import { addCacheFn, getExecuteScriptArgs } from '@/logics/executeScript/CachedExecute';
  import { executeAsyncScript, initChunkExecutor } from '@/logics/executeScript/ChunkSender';
  import {
    RQRequest,
    RQResponse,
    RQResponseStatus,
    type TRQResponse,
    RQWaitForRequests,
  } from '@/logics/executeScript/RequestQueue';
  import { ExecuteScriptSender, InitToken } from '@/logics/executeScript/executeScriptSender';
  import { IExecuteScriptSender } from '@/logics/executeScript/types';
  import { buildUUID } from '@/utils/uuid';
  import { Switch, Table, Space } from 'ant-design-vue';
  import { ColumnType } from 'ant-design-vue/lib/table';
  import { computed, h, nextTick, onMounted, onUnmounted, ref, unref, watch } from 'vue';
  import { useRouter } from 'vue-router';

  const { currentRoute } = useRouter();
  const computedQuery = computed(() => unref(currentRoute).query);

  const schemas: FormSchema[] = [
    {
      field: 'scope',
      component: 'Input',
    },
    {
      field: 'requestName',
      component: 'Input',
    },
    {
      field: 'responseContent',
      component: 'Input',
    },
  ];
  const model: {
    scope: string;
    requestName: string;
    responseContent: string;
  } = {
    scope: `Resource`,
    requestName: `hello`,
    responseContent: `response content`,
  };
  const [formRegister, { getFieldsValue }] = useForm({
    schemas,
    model,
  });
  const { createMessage } = useMessage();

  async function handleSubmit(values: typeof model) {
    console.log('values', values);
    // loading.value = true;
    const key = buildUUID();
    createMessage.loading({
      content: values.requestName,
      key,
    });
    const startAt = performance.now();
    try {
      const re = await executeAsyncScript(
        ...getExecuteScriptArgs('RQWaitForRequests', [values.scope]),
      );
      console.info(re);
      const duration = (performance.now() - startAt).toFixed(2);
      createMessage.success({
        content: h('div', [
          h('p', values.requestName),
          h('p', duration + 'ms'),
          h('pre', JSON.stringify(re, null, 2)),
        ]),
        key,
        duration: 3,
      });
    } catch (e) {
      // console.error(e);
      const duration = performance.now() - startAt;
      createMessage.error({
        content: values.requestName + `\n${duration}ms\n` + e?.toString?.(),
        key,
      });
      // createMessage.error(e?.toString?.());
    } finally {
      // loading.value = false;
    }
  }
  async function handleSendRequest() {
    const values: typeof model = getFieldsValue() as any;
    const re = await executeAsyncScript(
      ...getExecuteScriptArgs('RQRequest', [values.scope, values.requestName]),
    );
    console.info(re);
  }
  let executeScriptSender: IExecuteScriptSender;

  const loading = ref(false);

  const requestColumns: ColumnType[] = [
    {
      width: 200,
      dataIndex: 'requestId',
      key: 'requestId',
      title: 'id',
    },
    {
      dataIndex: 'request',
      key: 'request',
      title: 'name',
    },
    {
      dataIndex: 'data',
      key: 'data',
      title: 'data',
    },
    {
      title: 'Action',
      key: 'action',
      slots: { customRender: 'action' },
    },
  ];

  type TRQRequest = {
    requestId: string;
    request: string;
    data?: any;
  };
  const requestData = ref<TRQRequest[]>([]);

  const watchRequest = ref(false);
  watch(
    () => watchRequest.value,
    () => {
      if (watchRequest.value) {
        loopWatch();
      }
    },
  );

  async function loopWatch() {
    if (!watchRequest.value) return;
    const values: typeof model = getFieldsValue() as any;
    const re: TRQRequest[] = await executeAsyncScript(
      ...getExecuteScriptArgs('RQWaitForRequests', [values.scope]),
    );
    requestData.value.push(...re);
    nextTick(() => loopWatch());
  }

  function responseRQ(req: TRQRequest, status: RQResponseStatus) {
    const values: typeof model = getFieldsValue() as any;
    const res: TRQResponse = {
      requestId: req.requestId,
      status,
      data: [req.request, req.data],
    };
    executeAsyncScript(...getExecuteScriptArgs('RQResponse', [values.scope, res]));
  }

  onMounted(() => {
    executeScriptSender = new ExecuteScriptSender(unref(computedQuery) as InitToken);
    initChunkExecutor({
      chunkSize: 5,
      scriptExecutor: executeScriptSender,
    });
    addCacheFn({
      scriptId: 'RQRequest',
      fn: RQRequest,
      scriptExecutor: executeScriptSender,
    });
    addCacheFn({
      scriptId: 'RQResponse',
      fn: RQResponse,
      scriptExecutor: executeScriptSender,
    });
    addCacheFn({
      scriptId: 'RQWaitForRequests',
      fn: RQWaitForRequests,
      scriptExecutor: executeScriptSender,
    });
  });
  onUnmounted(() => {
    executeScriptSender.dispose();
  });
</script>
@/api/executeScript/executeScript/CachedExecute@/api/executeScript/executeScript/ChunkSender@/api/executeScript/executeScript/RequestQueue@/api/executeScript/executeScript/executeScriptSender@/api/executeScript/executeScript/types

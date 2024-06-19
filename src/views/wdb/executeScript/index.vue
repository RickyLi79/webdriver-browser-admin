<template>
  <h1>{{ computedQuery }}</h1>
  <BasicForm v-loading="loading" @register="formRegister" @submit="handleSubmit" />
</template>

<script setup lang="ts">
  import { BasicForm, FormSchema, useForm } from '@/components/Form';
  import { computed, h, onMounted, ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  // import { EXECUTE_CMD, ExecuteScriptSender, type InitToken } from './sendMessage';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { executeAsyncScript, initChunkExecutor } from '@/logics/executeScript/ChunkSender';
  // import { ExecuteScriptSender, InitToken } from '@/logics/executeScript/executeScriptSender';
  // import { EXECUTE_CMD, IExecuteScriptSender } from '@/logics/executeScript/types';
  import { buildUUID } from '@/utils/uuid';
  import { EXECUTE_CMD, executeAsyncScript } from '@/api/executeScript';

  const { currentRoute } = useRouter();
  const computedQuery = computed(() => unref(currentRoute).query);

  const schemas: FormSchema[] = [
    {
      field: 'script',
      component: 'InputTextArea',
      componentProps: {
        rows: 6,
      },
    },
    {
      field: 'mode',
      component: 'Switch',
      componentProps: {
        checkedChildren: EXECUTE_CMD.EXECUTE_SCRIPT,
        checkedValue: EXECUTE_CMD.EXECUTE_SCRIPT,
        unCheckedChildren: EXECUTE_CMD.EXECUTE_ASYNC_SCRIPT,
        unCheckedValue: EXECUTE_CMD.EXECUTE_ASYNC_SCRIPT,
      },
    },
  ];
  const model: {
    script: string;
    mode: EXECUTE_CMD;
  } = {
    script: `
    // import { EXECUTE_CMD, ExecuteScriptSender, type InitToken } from './sendMessage';
    return 1
    `.trim(),
    mode: EXECUTE_CMD.EXECUTE_SCRIPT,
  };
  const [formRegister] = useForm({
    schemas,
    model,
  });
  const { createMessage } = useMessage();
  async function handleSubmit(values: typeof model) {
    console.log('values', values);
    // loading.value = true;
    const key = buildUUID();
    createMessage.loading({
      content: values.mode,
      key,
    });
    const startAt = performance.now();
    try {
      const re = await executeAsyncScript(values.script);
      console.info(re);
      const duration = (performance.now() - startAt).toFixed(2);
      createMessage.success({
        content: h('div', [
          h('p', values.mode),
          h('p', duration + 'ms'),
          h('pre', JSON.stringify(re, null, 2)),
        ]),
        key,
        duration: 10,
      });
    } catch (e) {
      // console.error(e);
      const duration = performance.now() - startAt;
      createMessage.error({
        content: values.mode + `\n${duration}ms\n` + e?.toString?.(),
        key,
      });
      // createMessage.error(e?.toString?.());
    } finally {
      // loading.value = false;
    }
  }

  const loading = ref(false);
  onMounted(() => {
    // setupExecuteScriptApi(toRaw(unref(computedQuery)) as InitToken);
  });
  // onUnmounted(() => {
  //   executeScriptSender.dispose();
  // });
</script>

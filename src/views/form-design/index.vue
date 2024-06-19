<template>
  <PageWrapper dense contentFullHeight fixedHeight>
    <VFormDesign />
  </PageWrapper>
</template>

<script lang="ts" setup>
  import { PageWrapper } from '@/components/Page';
  import VFormDesign from './components/VFormDesign/index.vue';

  defineOptions({ name: 'FormDesignerDesign' });
</script>

<style lang="less" scoped></style>

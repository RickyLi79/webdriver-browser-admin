<template>
  <Badge count="DEV"> <slot></slot> </Badge>
</template>
<script lang="ts" setup>
  import { Badge } from 'ant-design-vue';
  import { defineComponent } from 'vue';

  defineComponent({
    name: 'DevOnly',
  });
</script>

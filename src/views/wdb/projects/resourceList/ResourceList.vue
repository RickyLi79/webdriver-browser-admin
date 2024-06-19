<template>
  <BasicTable @register="register">
    <template #toolbar>
      <Pagination v-bind="pagination" @change="paginationChange" />
      <a-button type="primary" @click="expandAll">展开全部</a-button>
      <a-button type="primary" @click="collapseAll">折叠全部</a-button>
      <a-button
        type="primary"
        @click="
          openAddResourceModal(true, {
            project: props.project.uid,
          })
        "
        >Add</a-button
      >
    </template>
  </BasicTable>
  <AddResourceModal @register="registerAddResource" @submit="getResourceListHandler({})" />
  <!-- <Modal1 @register="registerAddResource" /> -->
</template>
<script setup lang="ts">
  import { BasicColumn, BasicTable, useTable } from '@/components/Table';
  import { type FolderItem, type ResourceModel } from '../types';
  import { Tag, Space, Pagination } from 'ant-design-vue';
  import { ref, h, unref, toRaw, onMounted, defineProps, computed } from 'vue';
  import AddResourceModal from './AddResourceModal.vue';
  import { useModal } from '@/components/Modal';
  import { wdbResourceApi } from '@/api/wdb';
  import { ProjectModel } from '@/api/wdb/model/projectModel';
  import { ResourceMeta } from '@/api/wdb/model/ResourceModel';
  import { BasicPageResult } from '@/api/model/baseModel';

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

  const [registerAddResource, { openModal: openAddResourceModal }] = useModal();
  // const [registerAddResource, { openModal: openAddResourceModal }] = useModal();

  const columns: BasicColumn[] = [
    {
      title: 'versions',
      dataIndex: 'versions',
      customRender(opt) {
        const { items: records } = toRaw(unref(opt.record)) as {
          fullId: string;
          items: ResourceMeta[];
        };
        return h(
          Space,
          records.map((record) =>
            h(
              Tag,
              {
                color: 'blue',
                onClick: function (record: ResourceMeta) {
                  const model: ResourceModel = {
                    uid: record.uid,
                    project: props.project.uid,
                    category: record.category,
                    description: record.description,
                    fullId: record.fullId,
                    name: record.name,

                    version: record.version,
                    content: '',
                    contentType: record.contentType,
                  };
                  openAddResourceModal(true, model);
                }.bind(null, record),
              },
              record.version,
            ),
          ),
        );
      },

      fixed: 'left',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 100,
      format(text, record) {
        return record.items[0].category;
      },
    },
    {
      title: 'type',
      dataIndex: 'contentType',
      width: 100,
      format(text, record) {
        return record.items[0].contentType;
      },
    },
    {
      title: 'Full ID',
      dataIndex: 'fullId',
      width: 450,
    },
    {
      title: 'name',
      dataIndex: 'name',
      width: 150,
      format(text, record) {
        return record.items[0].name;
      },
    },
    {
      title: 'description',
      dataIndex: 'description',
      width: 250,
      format(text, record) {
        return record.items[0].description;
      },
    },
  ];

  // function handleAdd2(val: ResourceModel) {
  //   const paths = val.id.split('/');
  //   const resourceItem: ResourceItem = {
  //     id: paths.pop()!,
  //     fullId: val.id,
  //     title: val.title,
  //     content: { [val.version]: { hash: hashCode(val.content), value: val.content } },
  //   };
  //   let node = dataSource.value;
  //   while (paths.length > 0) {
  //     const iPath = paths.shift()!;
  //     const iNode = node.find((i) => i.id === iPath);
  //     if (!iNode) {
  //       const fi: FolderItem = {
  //         id: iPath,
  //         title: '',
  //         children: [],
  //       };
  //       node.push(fi);
  //       node = fi.children;
  //     } else if ('children' in iNode) {
  //       node = iNode.children;
  //     }
  //   }
  //   const lastNode: ResourceItem = node.find((i) => i.id === resourceItem.id) as any;
  //   if (lastNode) {
  //     lastNode.content[val.version] = {
  //       hash: hashCode(val.content),
  //       value: val.content,
  //     };
  //   } else {
  //     node.push(resourceItem);
  //   }
  // }

  const resourceList = ref<BasicPageResult<{ fullId: string; items: ResourceMeta[] }>>();

  // const dataSource = ref<(ResourceMeta | FolderItem)[]>([]);
  const dataSource = computed(() => {
    const list = toRaw(unref(resourceList)?.items);
    if (!list) return [];

    const re: (ResourceMeta | FolderItem)[] = [];
    for (const iMeta of list) {
      re.push(iMeta);
    }
    return re;
  });

  const [register, { expandAll, collapseAll }] = useTable({
    title: '树形表格',
    isTreeTable: true,
    accordion: true, // 手风琴效果
    columns,
    dataSource,
    rowKey: 'id',
  });

  const defaultPageSize = 20; // SHOULD set by config
  const pagination = computed(() => {
    return {
      // show: true,
      pageSize: resourceList.value?.pageSize ?? defaultPageSize,
      current: resourceList.value?.page ?? 1,
      // size: 'small',
      total: resourceList.value?.total ?? 0,

      showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} of ${total} items`,
      // position: 'both',
    };
  });
  function paginationChange(page: number, pageSize: number) {
    getResourceListHandler({ page, pageSize });
  }
  async function getResourceListHandler({
    page = pagination.value.current,
    pageSize = pagination.value.pageSize,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    const list = await wdbResourceApi.getResourceMetaList({
      project: props.project.uid,
      // category: 'config',
      page: page,
      pageSize: pageSize,
    });
    // console.info(list);
    const records = list.items.reduce<Recordable<ResourceMeta[]>>((re, i) => {
      if (!re[i.fullId]) {
        re[i.fullId] = [];
      }
      re[i.fullId].push(i);
      return re;
    }, {});
    resourceList.value = {
      items: Object.entries(records).map(([key, value]) => ({ fullId: key, items: value })),
      page: list.page,
      pageSize: list.pageSize,
      total: list.total,
    };
  }

  onMounted(() => {
    getResourceListHandler({});
  });
</script>

<script setup>
import { ref } from 'vue';
import ItemDraggableList from './ItemDraggableList.vue';

const list = ref([
  { name: 'item 1', children: [{ name: 'item 2', children: [] }] },
  { name: 'item 3', children: [{ name: 'item 4', children: [] }] },
  { name: 'item 5', children: [] },
]);
</script>

<template>
  <div class="flex justify-between">
    <ItemDraggableList v-model="list" class="w-full">
    </ItemDraggableList>
    <pre>{{ JSON.stringify(list, null, 2) }}</pre>
  </div>
</template>

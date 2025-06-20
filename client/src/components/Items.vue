<script setup>
import { ref } from 'vue';
import NestedDraggable from './NestedDraggable.vue'; // Adjust path as needed

const list = ref([
  { name: 'item 1', children: [{ name: 'item 2', children: [] }] },
  { name: 'item 3', children: [{ name: 'item 4', children: [] }] },
  { name: 'item 5', children: [] },
]);
</script>

<template>
  <div class="flex justify-between">
    <NestedDraggable v-model="list" class="w-full"></NestedDraggable>
    <pre>{{ JSON.stringify(list, null, 2) }}</pre>
  </div>
</template>

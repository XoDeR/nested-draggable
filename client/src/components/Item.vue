<script setup>
import { ref, onMounted } from 'vue'
import Items from './Items.vue'

const mockFetchItems = () => {
  items.value = [
    { name: 'item 1', children: [{ name: 'item 2', children: [] }] },
    { name: 'item 3', children: [{ name: 'item 4', children: [] }] },
    { name: 'item 5', children: [] },
  ]
}

const items = ref([]);

onMounted(() => {
  mockFetchItems()
})
</script>

<template>
  <Items :items="items" />
</template>
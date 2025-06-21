<script setup>
import { ref, onMounted } from 'vue'
import Items from './Items.vue'
import { useMockServer } from '@/composables/useMockServer'

const mockServer = useMockServer()

const items = ref([]);

onMounted(async () => {
  await mockServer.init()
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem.children
})

// Only for debugging
const resetData = async () => {
  await mockServer.reset()
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem.children
}
</script>

<template>
  <!-- Only for debugging -->
  <button @click="resetData" class="m-2 p-1 border">Reset Data</button>
  <Items :items="items" />
</template>
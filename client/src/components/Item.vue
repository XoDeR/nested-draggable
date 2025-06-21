<script setup>
import { ref, onMounted } from 'vue'
import Items from './Items.vue'
import { useMockServer } from '@/composables/useMockServer'

const mockServer = useMockServer()

const items = ref([]);
const nodeUuid = ref();

onMounted(async () => {
  await mockServer.init()
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem.children
  nodeUuid.value = nodeItem.uuid
})

// Only for debugging
const resetData = async () => {
  await mockServer.reset()
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem.children
  nodeUuid.value = nodeItem.uuid
}
</script>

<template>
  <!-- Only for debugging -->
  <button @click="resetData" class="m-2 p-1 border">Reset Data</button>
  <Items :items="items" :nodeUuid="nodeUuid" />
</template>
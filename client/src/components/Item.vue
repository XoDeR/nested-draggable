<script setup>
import { ref, onMounted } from 'vue'
import Items from './Items.vue'
import { useMockServer } from '@/composables/useMockServer'

const mockServer = useMockServer()

const items = ref([]);
const nodeUuid = ref();
const nodeType = ref();

onMounted(async () => {
  await mockServer.init()
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem?.children || [];
  nodeUuid.value = nodeItem?.uuid || null;
  nodeType.value = nodeItem?.type || null;
})

// Only for debugging
const resetData = async () => {
  await mockServer.reset()
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem.children
  nodeUuid.value = nodeItem.uuid
}

const sendReorderedItemsToServer = async (itemsToSend) => {
  console.log("itemsToSend", itemsToSend);

  await mockServer.reorderItems(JSON.stringify(itemsToSend))

  if (childRef.value?.onChangesSaved) {
    childRef.value.onChangesSaved()
  }

  // emulate fetching updated data from server
  const rawJson = await mockServer.getItemWithSubItems()
  const nodeItem = JSON.parse(rawJson)
  items.value = nodeItem.children
  nodeUuid.value = nodeItem.uuid
}

const childRef = ref(null)

</script>

<template>
  <!-- Only for debugging -->
  <button @click="resetData" class="m-2 p-1 border">Reset Data</button>
  <Items :items="items" :nodeUuid="nodeUuid" :nodeType="nodeType" @send-reordered-items="sendReorderedItemsToServer"
    ref="childRef" />
</template>
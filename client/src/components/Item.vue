<script setup>
import { ref, onMounted } from 'vue'
import Items from './Items.vue'
import { useMockServer } from '@/composables/useMockServer'

const mockServer = useMockServer()

const items = ref([]);

onMounted(async () => {
  await mockServer.init()
  const rawJson = await mockServer.getItemWithSubItems()
  items.value = JSON.parse(rawJson)
  console.log(items.value)
})
</script>

<template>
  <Items :items="items" />
</template>
<!-- <script setup>
import ItemsN from './ItemsN.vue'
</script>

<template>
  <ItemsN />
</template>

<style scoped>
.vue-nestable {
  list-style: none;
  padding-left: 0;
}

.vue-nestable-item {
  margin: 4px 0;
  padding: 8px;
  border: 1px solid #ccc;
  background: #f9f9f9;
}

.vue-nestable-handle {
  cursor: grab;
  font-weight: bold;
}
</style> -->

<!-- NestableExample.vue -->
<template>
  <VueNestable :value="items" @input="onChange">
    <template #default="{ item }">
      <VueNestableHandle>
        {{ item.text }}
      </VueNestableHandle>
    </template>
  </VueNestable>
</template>

<script setup>
import { ref } from 'vue'
import { VueNestable, VueNestableHandle } from 'vue3-nestable'

const items = ref([
  { id: 1, text: 'Item 1' },
  {
    id: 2,
    text: 'Item 2',
    children: [
      { id: 3, text: 'Nested 1' },
      { id: 4, text: 'Nested 2' }
    ]
  }
])

function onChange(newItems) {
  items.value = newItems
}
</script>

<style scoped>
.vue-nestable-handle {
  padding: 0.5rem;
  border: 1px solid #ccc;
  background: #f0f0f0;
  cursor: grab;
  margin-bottom: 4px;
}
</style>
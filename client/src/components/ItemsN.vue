<script setup>
import { ref } from 'vue'
import { VueNestable, VueNestableHandle } from 'vue3-nestable'

const nestableItems = ref([
  { id: 0, text: 'Andy' },
  {
    id: 1,
    text: 'Harry',
    children: [
      {
        id: 2,
        text: 'David 1',
        children: [
          { id: 3, text: 'David 2' },
          { id: 4, text: 'Lisa' }
        ]
      },
      { id: 5, text: 'Lisa 2' },
      { id: 6, text: 'Lisa 3' }
    ]
  },
  { id: 7, text: 'Lisa 4' }
])
</script>

<!-- NestableExample.vue -->
<template>
  <vue-nestable :value="nestableItems">
    <template #default="{ item }">
      <vue-nestable-handle>
        {{ item.text }}
      </vue-nestable-handle>
    </template>
  </vue-nestable>

  <pre><code>{{ nestableItems }}</code></pre>
</template>
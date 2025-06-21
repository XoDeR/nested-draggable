<script setup>
import { ref, watch, toRaw } from 'vue';
import ItemDraggableList from './ItemDraggableList.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

// copy to use with v-model
const localItems = ref(structuredClone(toRaw(props.items)));

// update when props are updated
watch(
  () => props.items,
  (newItems) => {
    localItems.value = structuredClone(toRaw(newItems));
  },
  { deep: true },
);

</script>

<template>
  <div class="flex justify-between">
    <ItemDraggableList v-model="localItems" class="w-full">
    </ItemDraggableList>
    <pre>{{ JSON.stringify(localItems, null, 2) }}</pre>
  </div>
</template>

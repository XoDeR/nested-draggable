<script setup>
import { VueDraggable } from 'vue-draggable-plus';
import { computed } from 'vue';

// Define the component so it can recursively reference itself.
// This is necessary in script setup for recursive components.
import NestedDraggable from './NestedDraggable.vue'; // Self-reference for recursive component

const props = defineProps({
  modelValue: {
    type: Array, // More general type for JS
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    // No type annotation needed for newValue in JS
    emit('update:modelValue', newValue);
  },
});
</script>

<template>
  <VueDraggable class="drag-area" tag="ul" v-model="model" group="g1" item-key="name" :fallbackOnBody="true"
    :swapThreshold="0.65">
    <li v-for="el in model" :key="el.name">
      <p>{{ el.name }}</p>
      <p>{{ el.name }}</p>
      <NestedDraggable v-if="el.children" v-model="el.children" class="nested-indent" />
    </li>
  </VueDraggable>
</template>

<style scoped>
/* .drag-area {
  min-height: 20px;
  outline: 1px dashed red;
  padding: 10px;
  margin: 5px;
}

li {
  background-color: #f0f0f0;
  margin-bottom: 5px;
  padding: 8px;
  cursor: grab;
} */

.drag-area {
  padding-left: 0;
  margin: 0;
  list-style-type: none;
}

li {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px 14px;
  margin: 8px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: background 0.2s ease;
}

li:hover {
  background: #f9f9f9;
}

.vue-draggable-item {
  cursor: grab;
}

.vue-draggable-item:active {
  cursor: grabbing;
}

.nested-indent {
  margin-left: 24px;
  border-left: 2px dashed #ccc;
  padding-left: 12px;
}
</style>
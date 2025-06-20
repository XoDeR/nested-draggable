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
  <VueDraggable class="drag-area" tag="ul" v-model="model" group="g1" item-key="name">
    <li v-for="el in model" :key="el.name">
      <p>{{ el.name }}</p>
      <p>{{ el.name }}</p>
      <NestedDraggable v-if="el.children" v-model="el.children" />
    </li>
  </VueDraggable>
</template>

<style scoped>
.drag-area {
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
}
</style>
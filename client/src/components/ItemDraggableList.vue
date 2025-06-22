<script setup>
import { VueDraggable } from 'vue-draggable-plus';
import { computed, ref } from 'vue';

// Recursive component
import ItemDraggableList from './ItemDraggableList.vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'nested-changed']);

const model = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit('update:modelValue', newValue);
  },
});

// Track x position
let dragStartX = 0

function onStart(evt) {
  dragStartX = evt.originalEvent.clientX
}

function onEnd(evt) {
  const dropX = evt.originalEvent.clientX
  const delta = dropX - dragStartX

  // Try to nest if dragged to the left
  if (delta > 40) {
    const dragged = evt.item.__vue__.item
    const parent = model.value[evt.newIndex - 1]
    if (parent) {
      parent.children = parent.children || []
      parent.children.push(dragged)
      model.value.splice(evt.newIndex, 1)
    }
  }
}

// Triggered whenever any changes are made to the list
function onSort(evt) {
  emit('nested-changed');
}

// Propagate change event from nested children up
const emitNestedChanged = () => {
  emit('nested-changed');
}

const isDraggable = ref(true); // whether drag-and-drop behavior enabled
</script>

<template>
  <VueDraggable class="pl-0 m-0 list-none" tag="div" v-model="model" group="g1" item-key="name" :fallbackOnBody="true"
    :swapThreshold="0.65" ghost-class="drag-ghost" @start="onStart" @end="onEnd" @sort="onSort"
    :disabled="!isDraggable">
    <div v-for="el in model" :key="el.name"
      class="px-[14px] py-0 rounded-md bg-neutral-100 dark:bg-neutral-800 box-border">
      <p>{{ el.name }}</p>
      <p>{{ el.uuid }}</p>
      <ItemDraggableList v-if="el.children" v-model="el.children" class="ml-6 pl-0"
        @nested-changed="emitNestedChanged" />
    </div>
  </VueDraggable>
</template>
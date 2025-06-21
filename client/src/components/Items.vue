<script setup>
import { ref, watch, toRaw } from 'vue';
import ItemDraggableList from './ItemDraggableList.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  nodeUuid: {
    type: String,
    required: true,
  }
});

const emit = defineEmits(['send-reordered-items'])

// copy to use with v-model
const localItems = ref(structuredClone(toRaw(props.items)));

// List of {uuid, order, parent} to send
// Order is normalized e.g.: [0, 1, 2, 3]
// for changes to send normalized orders are to be transformed to sparse orders
const changes = ref([]);
// normalized orders are mapped to sparse orders
const changesToSend = ref([]);

// converts nested list to a map to track changes for every item
const mapFromNestedList = (items, parentUuid = null) => {
  let flatMap = {};
  items.forEach((item, index) => {
    flatMap[item.uuid] = {
      order: index,
      parent: parentUuid,
    };
    if (item.children && item.children.length) {
      Object.assign(flatMap, mapFromNestedList(item.children, item.uuid));
    }
  });
  return flatMap;
}


// Called every time there are changes in a list
// Note: may be called twice if a child item is removed from one parent and assigned to another 
const trackChanges = () => {
  const previousStateMap = mapFromNestedList(props.items, props.nodeUuid);
  const currentStateMap = mapFromNestedList(localItems.value, props.nodeUuid);
  const newChanges = [];
  for (const uuid in currentStateMap) {
    const currentState = currentStateMap[uuid];
    const previousState = previousStateMap[uuid];

    // Item is new. Currently should not happen
    if (!previousState) {
      continue;
    }

    // either order or parent changed
    if (currentState.order !== previousState.order || currentState.parent !== previousState.parent) {
      let newOrder = null; // null means no changes should be done
      let newParent = null;
      if (currentState.order !== previousState.order) newOrder = currentState.order;
      if (currentState.parent !== previousState.parent) newParent = currentState.parent;
      newChanges.push({
        uuid: uuid,
        order: newOrder,
        parent: newParent,
      });
    }
  }
  changes.value = newChanges;
}

const resetChanges = () => {
  changes.value = [];
  changesToSend.value = [];
}

// update when props are updated
watch(
  () => props.items,
  (newItems) => {
    // update state with data retreived from server
    localItems.value = structuredClone(toRaw(newItems));
    resetChanges();
  },
  { deep: true },
);

const resetChangesAndState = () => {
  localItems.value = structuredClone(toRaw(props.items));
  resetChanges();
  alert('Changes reset');
}

const sparseOrdersFromNormalized = (changes) => {
  // TODO implement
  return changes;
}

const saveChanges = () => {
  console.log('Sending changes to server:', changesToSend.value);

  changesToSend.value = sparseOrdersFromNormalized(changes.value);

  // there would be a call to server
  // now it's emulated
  emit('send-reordered-items', changesToSend.value);
};

const onChangesSaved = () => {
  console.log('Changes saved from child!')
  // clear changes after sending
  resetChanges();
}

defineExpose({ onChangesSaved })

</script>

<template>
  <button @click="saveChanges" :disabled="!changes.length" :class="[
    'm-2 p-1 border rounded',
    !changes.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
  ]">
    Save changes
  </button>
  <button @click="resetChangesAndState" :disabled="!changes.length" :class="[
    'm-2 p-1 border rounded',
    !changes.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
  ]">
    Reset changes and state
  </button>
  <div class="flex justify-between">
    <ItemDraggableList v-model="localItems" class="w-full" @nested-changed="trackChanges" />
    <pre>{{ JSON.stringify(localItems, null, 2) }}</pre>
  </div>
</template>

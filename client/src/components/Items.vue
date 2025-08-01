<script setup>
import { ref, watch, computed, toRaw, onMounted, onUnmounted } from 'vue';
import ItemDraggableList from './ItemDraggableList.vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  nodeUuid: {
    type: String,
    required: true,
  },
  nodeType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['send-reordered-items'])

// copy to use with v-model
const localItems = ref(structuredClone(toRaw(props.items)));

// List of {uuid, order, parent, parentType} to send
// Order is normalized e.g.: [0, 1, 2, 3]
// for changes to send normalized orders are to be transformed to sparse orders
const changes = ref([]);
// normalized orders are mapped to sparse orders
const changesToSend = ref([]);

// Converts nested list to a map to track changes for every item
const mapFromNestedList = (items, parentUuid = null) => {
  let flatMap = {};
  items.forEach((item, index) => {
    flatMap[item.uuid] = {
      order: index,
      parent: parentUuid,
      type: item.type,
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

    // Either order or parent changed
    if (currentState.order !== previousState.order || currentState.parent !== previousState.parent) {
      let newOrder = null; // null means no changes should be done
      let newParent = null;
      let newParentType = null;
      // Properties order, parent, parentType of the individual item are changed in the nested list localItems
      // only after new changes are saved and retrieved from the server
      if (currentState.order !== previousState.order) newOrder = currentState.order;
      if (currentState.parent !== previousState.parent) {
        newParent = currentState.parent;
        // assign new parent type
        if (newParent === props.nodeUuid) {
          // parent is node (root) item
          newParentType = props.nodeType;
        } else {
          newParentType = currentStateMap[newParent].type;
        }
      }
      newChanges.push({
        uuid: uuid,
        order: newOrder,
        parent: newParent,
        parentType: newParentType,
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
}

const sparseOrdersFromNormalized = (changes, previousItems) => {
  const itemToParent = new Map()
  const parentToSparseList = new Map()

  // map item uuid to parent's uuid and map uuid to a list of sparse orders
  function processNestedList(nestedList, parentId = null) {
    for (const item of nestedList) {
      itemToParent.set(item.uuid, parentId)
      const children = item.children || []
      if (!parentToSparseList.has(item.uuid)) {
        parentToSparseList.set(
          item.uuid,
          children.map(childItem => childItem.order)
        )
      }
      processNestedList(children, item.uuid)
    }
  }

  const nodeParentUuid = props.nodeUuid;
  processNestedList(previousItems, nodeParentUuid)
  // Node (root of all other items) item should be added explicitly
  // to parentToSparseList as it is not in the nested list
  parentToSparseList.set(
    nodeParentUuid,
    previousItems.map(childItem => childItem.order)
  )

  return changes.map(change => {
    const parentId = change.parent ?? itemToParent.get(change.uuid)
    const sparseList = parentToSparseList.get(parentId) || []
    const normalizedIndex = change.order

    let sparseOrder;

    if (normalizedIndex === null) {
      sparseOrder = null; // null means order has the same value and should not be changed
    }
    else if (normalizedIndex < sparseList.length) {
      // Use existing sparse order at the same index
      sparseOrder = sparseList[normalizedIndex]
    } else {
      const lastSparse = sparseList.length > 0 ? sparseList[sparseList.length - 1] : -1
      const diff = normalizedIndex - (sparseList.length - 1)
      sparseOrder = lastSparse + diff
    }
    return {
      ...change,
      order: sparseOrder,
    }
  })
}

const saveChanges = () => {
  console.log("Norm", changes.value);
  changesToSend.value = sparseOrdersFromNormalized(changes.value, props.items);
  console.log("Sparse", changesToSend.value);

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

const reorderEnabled = ref(true);

const toggleReorderEnabled = () => {
  reorderEnabled.value = !reorderEnabled.value;
}

const hasUnsavedChanges = computed(() => changes.value.length > 0);

// Show a warning if user navigates away and there are unsaved changes
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges.value) {
    const confirmationMessage = 'Changes you made may not be saved.';
    event.returnValue = confirmationMessage;
    return confirmationMessage;
  }
};

// Ctrl+S, Ctrl+Z handler
function handleKeyDown(e) {
  // shortcut modifier key is being held -- Ctrl or Cmd (for Mac)
  const isShortcut = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();

  // Ctrl+S
  if (isShortcut && key === 's') {
    if (hasUnsavedChanges.value === true) {
      e.preventDefault();
      saveChanges();
    }
  }

  // Ctrl+Z
  if (isShortcut && key === 'z') {
    if (hasUnsavedChanges.value === true) {
      e.preventDefault();
      localItems.value = structuredClone(toRaw(props.items));
      resetChanges();
    }
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('keydown', handleKeyDown)
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

// Debugging only
// Simulate adding changes to check "Unsaved changes"
// setTimeout(() => {
//   changes.value.push({ uuid: 'FFFF', order: 0, parent: 'AAAA', parentType: 'qqqq' });
// }, 1000); // after 1 second

// setTimeout(() => {
//   changes.value.push({ uuid: 'FFEE', order: 0, parent: 'AAAA', parentType: 'qqqq' });
// }, 2000); // after 2 seconds

// setTimeout(() => {
//   const index = changes.value.findIndex(item => item.uuid === 'FFEE')
//   if (index !== -1) {
//     changes.value.splice(index, 1)
//   }
// }, 3000);

// setTimeout(() => {
//   const index = changes.value.findIndex(item => item.uuid === 'FFFF')
//   if (index !== -1) {
//     changes.value.splice(index, 1)
//   }
// }, 5000);
//-- Debugging only

</script>

<template>
  <span v-if="hasUnsavedChanges"
    class="bg-yellow-400 text-[#333] px-[10px] py-[5px] rounded text-[0.8em] font-bold ml-[15px] inline-block">
    Unsaved Changes!
  </span>
  <button @click="saveChanges" aria-keyshortcuts="Control+S Meta+S" :disabled="!changes.length" :class="[
    'm-2 p-1 border rounded',
    !changes.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
  ]">
    Save changes
  </button>
  <button @click="resetChangesAndState" aria-keyshortcuts="Control+Z Meta+Z" :disabled="!changes.length" :class="[
    'm-2 p-1 border rounded',
    !changes.length ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
  ]">
    Revert unsaved changes
  </button>
  <button @click="toggleReorderEnabled" class="p-2 m-2 border rounded">
    {{ reorderEnabled ? 'Disable reordering' : 'Enable reordering' }}
  </button>
  <div class="flex justify-between">
    <ItemDraggableList :isDraggable="reorderEnabled" v-model="localItems" class="w-full"
      @nested-changed="trackChanges" />
    <!-- For debugging only -->
    <pre>{{ JSON.stringify(localItems, null, 2) }}</pre>
  </div>
</template>

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


// Called every time drag is finished or updated data retrieved from the server 
const trackChanges = () => {
  console.log("item changed");

  const previousStateMap = mapFromNestedList(props.items);
  console.log("previousStateMap", previousStateMap);
}

// update when props are updated
watch(
  () => props.items,
  (newItems) => {
    // update state with data retreived from server
    localItems.value = structuredClone(toRaw(newItems));
    trackChanges();
  },
  { deep: true },
);

</script>

<template>
  <div class="flex justify-between">
    <ItemDraggableList v-model="localItems" class="w-full" @nested-changed="trackChanges" />
    <pre>{{ JSON.stringify(localItems, null, 2) }}</pre>
  </div>
</template>

import { ref } from 'vue'

const LOCAL_STORAGE_KEY = 'mock-server-items'

const expectedInitialData = {
  uuid: 'AAAA',
  modelType: 'Aaaa',
  type: 'nodeRoot',
  name: 'Root item',
  parent: null,
  order: 0,
  children: [
    {
      uuid: 'ABAA',
      name: 'Item 0001',
      parent: 'AAAA',
      order: 0,
      children: [
        {
          uuid: 'ABBA',
          name: 'Item 0004',
          parent: 'ABAA',
          order: 0,
          children: [],
        },
        {
          uuid: 'ABCA',
          name: 'Item 0006',
          parent: 'ABAA',
          order: 2,
          children: [],
        },
      ],
    },
    {
      uuid: 'ACAA',
      name: 'Item 0002',
      parent: 'AAAA',
      order: 2,
      children: [
        {
          uuid: 'ACBA',
          name: 'Item 0005',
          parent: 'ACAA',
          order: 0,
          children: [],
        },
      ],
    },
    {
      uuid: 'ADAA',
      name: 'Item 0003',
      parent: 'AAAA',
      order: 5,
      children: [],
    },
  ]
}

function listFromTree(tree) {
  const result = []

  function traverse(node) {
    // Clone without children to flatten
    const { children = [], ...rest } = node
    result.push(rest)

    children.forEach(traverse)
  }

  traverse(tree)
  return result
}

function treeFromList(list) {
  const nodeMap = new Map()
  list.forEach(item => nodeMap.set(item.uuid, { ...item, children: [] }))

  let root = null

  for (const item of nodeMap.values()) {
    if (item.type === 'nodeRoot') {
      root = item
    } else if (item.parent && nodeMap.has(item.parent)) {
      const parent = nodeMap.get(item.parent)
      parent.children.push(item)
      parent.children.sort((a, b) => a.order - b.order)
    }
  }

  return root
}

export function useMockServer() {
  const data = ref([])

  async function reset() {
    // Initialize with default mock data
    /*
    data.value = [
      { name: 'item 1', children: [{ name: 'item 2', children: [] }] },
      { name: 'item 3', children: [{ name: 'item 4', children: [] }] },
      { name: 'item 5', children: [] },
    ]
    */
    data.value = listFromTree(expectedInitialData)

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.value))
  }

  async function init() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      data.value = JSON.parse(stored)
    } else {
      await reset();
    }
  }

  async function getItemWithSubItems() {
    const tree = treeFromList(data.value);
    return JSON.stringify(tree)
  }

  async function reorderItems(newJson) {
    try {
      const newData = JSON.parse(newJson)
      // map uses references, so data in data.value will be updated
      const dataMap = new Map(data.value.map(item => [item.uuid, item]))
      for (const update of newData) {
        const existing = dataMap.get(update.uuid)
        if (existing) {
          if (update.order !== null) {
            existing.order = update.order
          }
          if (update.parent !== null) {
            existing.parent = update.parent
          }
        }
      }
      console.log("server data", data.value);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.value))
    } catch (err) {
      console.error('Failed to reorder items:', err)
    }
  }

  return {
    init,
    reset,
    getItemWithSubItems,
    reorderItems,
  }
}

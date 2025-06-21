import { ref } from 'vue'

const LOCAL_STORAGE_KEY = 'mock-server-items'

export function useMockServer() {
  const data = ref([])

  async function reset() {
    // Initialize with default mock data
    data.value = [
      { name: 'item 1', children: [{ name: 'item 2', children: [] }] },
      { name: 'item 3', children: [{ name: 'item 4', children: [] }] },
      { name: 'item 5', children: [] },
    ]
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
    return JSON.stringify(data.value)
  }

  async function reorderItems(newJson) {
    try {
      const newData = JSON.parse(newJson)
      data.value = newData
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData))
    } catch (err) {
      console.error('Failed to reorder items:', err)
    }
  }

  return {
    init,
    getItemWithSubItems,
    reorderItems,
  }
}

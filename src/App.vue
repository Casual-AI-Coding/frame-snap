<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.loadFromLocalStorage()
})
</script>

<template>
  <router-view />
</template>

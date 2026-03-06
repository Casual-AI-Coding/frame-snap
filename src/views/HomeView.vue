<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useEditorStore } from "@/stores";
import { parseExif, type ExifData } from "@/utils/exif";

const router = useRouter();
const editorStore = useEditorStore();
const isDragging = ref(false);
const isLoading = ref(false);

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  loadImage(file);
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  if (file && file.type.startsWith("image/")) {
    loadImage(file);
  }
}

function loadImage(file: File) {
  isLoading.value = true;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const result = e.target?.result as string;
    const img = new Image();
    img.onload = async () => {
      // Extract EXIF data
      let exifData: ExifData | null = null;
      try {
        exifData = await parseExif(result);
      } catch {
        // Ignore EXIF parsing errors
        exifData = null;
      }
      editorStore.setImage(result, img.width, img.height, exifData);
      isLoading.value = false;
      router.push("/editor");
    };
    img.onerror = () => {
      isLoading.value = false;
      alert("图片加载失败，请重试");
    };
    img.src = result;
  };
  reader.onerror = () => {
    isLoading.value = false;
    alert("文件读取失败，请重试");
  };
  reader.readAsDataURL(file);
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl/Cmd + U to trigger upload
  if ((event.ctrlKey || event.metaKey) && event.key === "u") {
    event.preventDefault();
    const input = document.querySelector('.upload-button input') as HTMLInputElement;
    input?.click();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

function goToEditor() {
  router.push("/editor");
}

function goToTemplates() {
  router.push("/templates");
}
</script>

<template>
  <div class="home">
    <header class="header">
      <div class="logo">
        <span class="logo-icon">◉</span>
        <span class="logo-text">FrameSnap</span>
        <span class="logo-sub">帧像</span>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <h1 class="title">照片水印 & 相框工具</h1>
        <p class="subtitle">简单、专业、高效</p>
      </section>

      <section class="upload-section">
        <label
          class="upload-button"
          :class="{ dragging: isDragging, loading: isLoading }"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
        >
          <input
            type="file"
            accept="image/*"
            :disabled="isLoading"
            @change="handleFileUpload"
            hidden
          />
          <span v-if="isLoading" class="loading-spinner"></span>
          <template v-else>
            <span class="upload-icon">+</span>
            <span class="upload-text">上传图片</span>
            <span class="upload-hint">点击或拖拽图片到这里</span>
          </template>
        </label>
        <p class="shortcut-hint">快捷键: Ctrl+U</p>
      </section>

      <section class="quick-actions">
        <button class="action-button" @click="goToEditor">
          <span class="action-icon">✎</span>
          <span class="action-text">编辑器</span>
        </button>
        <button class="action-button" @click="goToTemplates">
          <span class="action-icon">▦</span>
          <span class="action-text">模板库</span>
        </button>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-primary);
}

.header {
  padding: 20px 40px;
  border-bottom: 1px solid var(--border-color);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 28px;
  color: var(--accent-color);
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-sub {
  font-size: 14px;
  color: var(--text-secondary);
}

.main {
  max-width: 600px;
  margin: 0 auto;
  padding: 80px 20px;
  text-align: center;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 60px;
}

.upload-section {
  margin-bottom: 40px;
}

.upload-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-button:hover {
  border-color: var(--accent-color);
  background: rgba(255, 107, 53, 0.05);
}

.upload-button.dragging {
  border-color: var(--accent-color);
  background: rgba(255, 107, 53, 0.15);
  transform: scale(1.02);
}

.upload-button.loading {
  cursor: wait;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 107, 53, 0.3);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.upload-icon {
  font-size: 48px;
  color: var(--accent-color);
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: var(--text-secondary);
}

.upload-hint {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.6;
  margin-top: 8px;
}

.shortcut-hint {
  font-size: 12px;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-top: 16px;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 24px;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.action-text {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>

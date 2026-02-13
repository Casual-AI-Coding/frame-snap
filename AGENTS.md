# AGENTS.md - Developer Guide for FrameSnap

## Project Overview

This is a pure frontend web application using Vue 3, TypeScript, and Fabric.js for photo watermark and frame editing.

## Build, Lint & Test Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing
```bash
npm run test              # Run all tests once
npm run test src/path/to/file.test.ts    # Run single test file
npm run test -- --watch  # Run tests in watch mode
npm run test -- --run     # Run tests once (non-watch, for CI)
npm run test:coverage    # Run tests with coverage report
```

### Linting & Formatting
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run typecheck        # Run TypeScript type checking
```

---

## Code Style Guidelines

### TypeScript Configuration

All TypeScript code should follow strict mode guidelines:
- Enable `strict: true` in tsconfig.json
- Use explicit return types for exported functions
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any`; narrow types before use

### Imports Organization

Organize imports in the following order (separate with blank lines):

```typescript
// 1. Node.js built-ins
import path from 'path';
import fs from 'fs';

// 2. External libraries
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { fabric } from 'fabric';

// 3. Internal modules (absolute imports)
import { useEditorStore } from '@/stores/editor';
import { watermarkEngine } from '@/engines/watermark';

// 4. Relative imports
import CanvasEditor from './components/CanvasEditor.vue';
import styles from './App.module.css';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `UserProfile.vue` |
| Files (utils/hooks) | camelCase | `useAuth.ts` |
| Files (config) | kebab-case | `firebase-config.ts` |
| Functions | camelCase | `getUserById()` |
| Components | PascalCase | `UserProfile` |
| Hooks | camelCase (prefix `use`) | `useAuth` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Enums | PascalCase | `UserRole` |
| Enum Values | PascalCase | `UserRole.Admin` |
| CSS Classes | kebab-case | `.main-container` |

### Vue Component Structure

Follow this structure for Vue 3 components:

```typescript
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue';
import { useEditorStore } from '@/stores/editor';
import type { Layer } from '@/types';

// 2. Props & Emits
interface Props {
  imageId: string;
  onUpdate?: (layer: Layer) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onUpdate: undefined,
});

const emit = defineEmits<{
  (e: 'save', data: Layer): void;
  (e: 'cancel'): void;
}>();

// 3. Store
const editorStore = useEditorStore();

// 4. State
const isLoading = ref(true);
const activeLayer = computed(() => editorStore.activeLayer);

// 5. Methods
const handleSave = () => {
  emit('save', activeLayer.value);
};

// 6. Lifecycle
onMounted(() => {
  editorStore.loadImage(props.imageId);
});
</script>

<template>
  <!-- 7. Template -->
  <div class="editor-panel">
    <h2>{{ $t('editor.title') }}</h2>
    <slot />
  </div>
</template>

<style scoped>
/* 8. Styles */
.editor-panel {
  background: var(--bg-primary);
}
</style>
```

### Error Handling

Use structured error handling patterns:

```typescript
// 1. Custom error classes for domain errors
class ImageLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageLoadError';
  }
}

class ExportError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ExportError';
  }
}

// 2. Try-catch with typed errors
async function loadImage(file: File): Promise<string> {
  try {
    const base64 = await fileToBase64(file);
    return base64;
  } catch (error) {
    if (error instanceof ImageLoadError) throw error;
    throw new ImageLoadError('Failed to load image');
  }
}
```

### Testing Guidelines (Vitest)

```typescript
// 1. Follow AAA pattern (Arrange, Act, Assert)
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '@/stores/editor';

describe('EditorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('addWatermark', () => {
    it('should add watermark to layers', () => {
      // Arrange
      const store = useEditorStore();
      const watermarkData = { type: 'text', text: 'Test' };

      // Act
      store.addWatermark(watermarkData);

      // Assert
      expect(store.layers).toHaveLength(1);
      expect(store.layers[0].type).toBe('text');
    });

    it('should throw when image not loaded', () => {
      const store = useEditorStore();
      expect(() => store.addWatermark({} as any)).toThrow();
    });
  });
});
```

---

## Git Commit Messages

Follow Conventional Commits:

```
feat: add user registration
fix: resolve login redirect issue
docs: update API documentation
refactor: simplify user service
test: add unit tests for auth
chore: update dependencies
```

### Git Workflow

#### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<ticket>-<short-description>` | `feature/F001-add-watermark` |
| Bugfix | `fix/<ticket>-<short-description>` | `fix/F002-fix-canvas-render` |
| Hotfix | `hotfix/<ticket>-<short-description>` | `hotfix/F003-crash-on-export` |
| Refactor | `refactor/<scope>-<short-description>` | `refactor/store-move-to-pinia` |
| Docs | `docs/<short-description>` | `docs/add-api-documentation` |

#### Workflow

```bash
# 1. Start new feature
git checkout main
git pull origin main
git checkout -b feature/F001-add-watermark

# 2. Work and commit
git add .
git commit -m "feat(watermark): add text watermark feature"

# 3. Keep branch updated
git fetch origin
git rebase origin/main

# 4. Push and create PR
git push -u origin feature/F001-add-watermark
# Then create PR via GitHub CLI or web UI
```

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:

```
feat(watermark): add text watermark positioning

- Add position options: topLeft, topRight, bottomLeft, bottomRight
- Support custom offset values
- Update layer panel to show position selector

Closes #F001
```

#### Allowed Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependencies |
| `ci` | CI configuration |
| `build` | Build system changes |

#### Git Commands Best Practices

```bash
# Never force push to main
git push --force-with-lease  # Safer alternative if needed

# Interactive rebase for clean history
git rebase -i HEAD~3  # Squash last 3 commits

# Stash changes properly
git stash push -m "WIP: working on feature X"

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all uncommitted changes
git checkout -- .
git clean -fd
```

---

## Testing Guidelines

### Test Coverage Requirement

**Minimum coverage: 80%**

Run coverage report:
```bash
npm run test:coverage
```

Ensure coverage meets threshold before committing.

### Testing Commands

```bash
npm run test              # Run all tests once
npm run test src/path/to/file.test.ts    # Run single test file
npm run test -- --watch  # Watch mode
npm run test -- --run     # Run once (non-watch, for CI)
npm run test:coverage    # Run tests with coverage report
```

---

## Verification Checklist

Before marking any work as complete:

- [ ] All tests pass (`npm run test`)
- [ ] Test coverage >= 80% (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Build succeeds (`npm run build`)

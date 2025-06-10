<template>
  <Transition name="toast">
    <div v-if="show" class="toast" :class="type">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'info'
}

withDefaults(defineProps<Props>(), {
  type: 'success'
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  pointer-events: none;
}

.success {
  background: #059669;
}

.error {
  background: #dc2626;
}

.info {
  background: #2563eb;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 1rem));
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .toast {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
}
</style>

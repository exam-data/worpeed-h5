<template>
  <div class="app-layout">
    <!-- 顶部标题 -->
    <header class="top-header">
      <h1>沃皮单词</h1>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <slot></slot>
    </main>

    <!-- 底部导航栏 -->
    <footer class="bottom-nav">
      <nav class="nav-content">
        <router-link to="/" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" class="nav-icon">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          <span class="nav-label">学习</span>
        </router-link>

        <router-link to="/wordlist" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" class="nav-icon">
            <path
              d="M7,13L11,17L17,11L15.59,9.59L11,14.17L8.41,11.59L7,13M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z"
            />
          </svg>
          <span class="nav-label">单词列表</span>
        </router-link>

        <router-link to="/settings" class="nav-item" active-class="active">
          <svg viewBox="0 0 24 24" class="nav-icon">
            <path
              d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
            />
          </svg>
          <span class="nav-label">设置</span>
        </router-link>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 不再需要任何脚本代码
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部标题 */
.top-header {
  padding: 1.5rem 2rem 1rem;
  text-align: center;
}

.top-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.02em;
}

/* 主体内容 */
.main-content {
  flex: 1;
  overflow: hidden;
  padding: 0.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 底部导航栏 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0.75rem 0 calc(env(safe-area-inset-bottom, 0.75rem) + 0.75rem);
  box-shadow: 0 -8px 16px rgba(0, 0, 0, 0.08);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  max-width: 560px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 4.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

.nav-item:hover {
  background: rgba(37, 99, 235, 0.06);
  color: #2563eb;
}

.nav-item.active {
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.nav-icon {
  width: 1.625rem;
  height: 1.625rem;
  fill: currentColor;
}

.nav-label {
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .top-header {
    padding: 1.25rem 1.5rem 0.75rem;
  }

  .top-header h1 {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 0.5rem 0.75rem 1.5rem;
  }

  .nav-item {
    padding: 0.5rem 1rem;
    min-width: 3.5rem;
  }

  .nav-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .nav-label {
    font-size: 0.75rem;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .app-layout {
    background: #0f172a;
  }

  .top-header h1 {
    color: #f1f5f9;
  }

  .bottom-nav {
    background: rgba(15, 23, 42, 0.95);
    border-top-color: rgba(255, 255, 255, 0.08);
  }

  .nav-item {
    color: #94a3b8;
  }

  .nav-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
  }

  .nav-item.active {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }
}
</style>

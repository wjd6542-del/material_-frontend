<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in" appear>
        <component :is="Component" :key="$route.fullPath" />
      </transition>
    </router-view>
  </div>
</template>

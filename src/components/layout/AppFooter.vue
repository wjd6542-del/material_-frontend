<template>
  <div class="min-h-screen flex">
    <!-- 좌측 브랜드 영역 -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-blue-600 text-white items-center justify-center"
    >
      <div class="max-w-md text-center px-8">
        <h1 class="text-4xl font-bold mb-4">자재관리 시스템</h1>

        <p class="text-blue-100 leading-relaxed">
          재고, 입고, 출고를 효율적으로 관리하는 통합 자재 관리 플랫폼입니다.
        </p>

        <div class="mt-10 text-sm text-blue-200">
          Material Management System
        </div>
      </div>
    </div>

    <!-- 로그인 영역 -->
    <div class="flex flex-1 items-center justify-center bg-gray-50">
      <div class="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <!-- title -->
        <div class="mb-8 text-center">
          <h2 class="text-2xl font-bold text-gray-800">관리자 로그인</h2>
        </div>

        <!-- form -->
        <form class="space-y-5">
          <!-- 아이디 -->
          <div>
            <label class="text-sm text-gray-600"> 아이디 </label>

            <input
              type="text"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="아이디 입력"
            />
          </div>

          <!-- 비밀번호 -->
          <div>
            <label class="text-sm text-gray-600"> 비밀번호 </label>

            <input
              type="password"
              class="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="비밀번호 입력"
            />
          </div>

          <!-- 로그인 버튼 -->
          <button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
          >
            로그인
          </button>
        </form>

        <!-- footer -->
        <div class="text-center text-xs text-gray-400 mt-6">
          © 2026 Material Management
        </div>
      </div>
    </div>
  </div>
</template>

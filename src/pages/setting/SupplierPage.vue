<template>
  <div
    class="p-4 lg:col-span-8 bg-white rounded-xl shadow border border-gray-200"
  >
    <Supplier />
  </div>
</template>

<script>
import Supplier from "@/components/setting/Supplier.vue";

export default {
  name: "SupplierPage",
  components: { Supplier },
};
</script>

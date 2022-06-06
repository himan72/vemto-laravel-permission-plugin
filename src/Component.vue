<template>
    <div class="w-full">
      <div>
        <h3 class="block font-bold mb-2">Authenticatable Model</h3>
        <div class="relative">
          <span>{{ pluginData.authModel.name }}</span>
        </div>
      </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            pluginData: {},
        }
    },
    created() {
       this.pluginData = window.vemtoApi.getPluginData()
      window.vemtoApi.detail(this.pluginData.authModel.name)
      window.vemtoApi.logBase.detail(this.pluginData.authModel.name)
    },

    methods: {
    }
}
</script>

<template>
  <div id="app">
    <el-tabs class="tabs" v-model="tabName" tab-position="left" @tab-click="changeTab">
      <el-tab-pane label="提取增量" name="GetExcel">
        <GetExcel @showLoading="showLoading" />
      </el-tab-pane>
      <el-tab-pane label="翻译转换" name="ExcelToJs">
        <ExcelToJs @showLoading="showLoading" />
      </el-tab-pane>
    </el-tabs>
    <!-- <div id="nav">
      <router-link to="/">提取增量</router-link> |
      <router-link to="/about">生成对应翻译js文件</router-link>
    </div> -->
  </div>
</template>
<script>
import GetExcel from './views/Home'
import ExcelToJs from './views/About'
export default {
  name: 'app',
  components: {
    GetExcel,
    ExcelToJs
  },
  data() {
    return {
      loading: null,
      tabName: 'GetExcel'
    }
  },
  created() {
    this.$electron.ipcRenderer.on('downLoadFile', (event, data) => {
      this.loading.close()
      console.log(data)
      if (data.error) {
        this.$message.error(data.message)
      } else {
        this.$electron.shell.showItemInFolder(data.data)
      }
    })
  },
  methods: {
    showLoading() {
      this.loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.2)'
      })
    },
    changeTab(value) {
      this.tabName = value.name
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  margin-left: 20px;
  .tabs {
    height: calc(100vh - 20px);
  }
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

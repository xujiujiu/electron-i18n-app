<template>
  <div class="home">
    <el-form :model="form" :rules="rules" ref="form" label-position="right" label-width="200px">
      <el-form-item label="xlsx文件路径" prop="filePath">
        <el-input v-model="form.filePath" placeholder="请选择翻译好的xlsx文件">
          <el-button slot="append">
            <label for="filePath2">浏览</label>
            <input
              type="file"
              id="filePath2"
              style="display: none;"
              accept=".xlsx"
              @change="e => getFilePath(e, 'filePath')"
            />
          </el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="生成的文件保存地址" prop="savePath">
        <el-input v-model="form.savePath" placeholder="请选择文件夹">
          <el-button slot="append">
            <label for="savePath2">请选择</label>
            <input
              type="file"
              id="savePath2"
              style="display: none;"
              webkitdirectory
              @change="getFolderPath"
            />
          </el-button>
        </el-input>
      </el-form-item>
      <el-form-item label="生成文件名" prop="saveFileName">
        <el-input v-model="form.saveFileName">
          <label slot="append">
            {{ fileType }}
          </label>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">转换</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: 'Home',
  data() {
    return {
      fileType: '.js',
      form: {
        filePath: '',
        savePath: '',
        saveFileName: 'translate'
      },
      rules: {
        filePath: [
          {
            required: true,
            message: '请选择翻译好的xlsx文件',
            trigger: 'blur'
          }
        ],
        savePath: [
          {
            required: true,
            message: '请选择生成的文件保存路径',
            trigger: 'blur'
          }
        ],
        saveFileName: [
          {
            required: true,
            // eslint-disable-next-line no-useless-escape
            pattern: /^[^/\\\\:\\*\\?\\<\\>\\|\"]{1,20}$/,
            message: '请输入合法的文件名（最多20字符）',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    getFilePath(e, key) {
      console.log(e.target.files[0].name)
      if (!this.exeType(e.target.files[0].name)) {
        this.$message.warning('请选择js语言文件')
        return
      }
      this.form[key] = e.target.files[0].path
    },
    getFolderPath(e) {
      console.log(e)
      let filePath = e.target.files[0].path
      let fileName = e.target.files[0].name
      this.form.savePath = filePath.slice(0, filePath.lastIndexOf(fileName) - 1)
    },
    exeType(name) {
      let type = name.slice(name.lastIndexOf('.'))
      return type === '.xlsx'
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$electron.ipcRenderer.send('onGetData', {
            type: 'toJs',
            ...this.form,
            saveFileName: this.form.saveFileName + this.fileType
          })
          this.$emit('showLoading')
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.home {
  width: 80%;
  // margin: 0 auto;
}
</style>

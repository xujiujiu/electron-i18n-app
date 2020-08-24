/* eslint-disable no-useless-escape */
const xlsx = require('node-xlsx').default
const set = require('lodash.set')
const get = require('lodash.get')
const fs = require('fs')
const path = require('path')
const os = require('os')

const jsonToData = str => {
  let codeArr = str.split(os.EOL)
  for (let i = 0; i < codeArr.length; i++) {
    codeArr[i] = codeArr[i].replace(/[\r\n]/g, '')
    let code = codeArr[i].replace(/^\s+|\s+$/g, '')
    if (code.indexOf('//') >= 0 || code.indexOf('/*') >= 0) {
      if (code.indexOf('//') === 0 || code.indexOf('/*') >= 0) {
        codeArr.splice(i, 1)
        i--
      } else {
        // todo /* 注释标识符判断
        codeArr[i] = codeArr[i].slice(0, codeArr[i].indexOf(code.slice(code.indexOf('//'))))
      }
    }
  }

  let s = codeArr.join('')
  let json
  try {
    json = JSON.parse(s)
  } catch (e) {
    try {
      const obj = eval('(' + s + ')')
      json = JSON.parse(JSON.stringify(obj))
    } catch (e) {
      throw {
        error: 1,
        message: 'js文件内容需为键值对对象格式的模块文件'
      }
    }
  }

  return json
}

const objToLink = (list, obj, translateUrl, traJson, linkStr) => {
  for (let lkey in obj) {
    if (typeof obj[lkey] === 'string') {
      if (translateUrl && get(traJson, linkStr) && get(traJson, `${linkStr}.${lkey}`)) {
        list.push([`${linkStr}.${lkey}`, obj[lkey], get(traJson, `${linkStr}.${lkey}`)])
      } else {
        list.push([`${linkStr}.${lkey}`, obj[lkey]])
      }
    }
    if (typeof obj[lkey] === 'object') {
      objToLink(list, obj[lkey], translateUrl, traJson, `${linkStr}.${lkey}`)
    }
  }
}

const arrayToObject = array => {
  let obj = {}
  array.forEach(item => {
    let value = item[item.length - 1].replace('"\'', "\\'")
    set(obj, item[0], value)
  })
  return obj
}

const toExcel = (url, filepath, fileName, translateUrl) => {
  return new Promise((resolve, reject) => {
    try {
      let traJson, traCode
      const code = fs.readFileSync(url.replace('/', path.sep), 'utf-8')
      const json = jsonToData(
        code.slice(code.indexOf('{'), code.lastIndexOf('}') + 1).replace(/\'/g, '"')
      )
      if (translateUrl) {
        traCode = fs.readFileSync(translateUrl.replace('/', path.sep), 'utf-8')
        traJson = jsonToData(
          traCode.slice(traCode.indexOf('{'), traCode.lastIndexOf('}') + 1).replace(/\'/g, '"')
        )
      }
      let title = ['key', '简体中文', '<Translate>']
      let data = [title]
      for (let key in json) {
        objToLink(data, json[key], translateUrl, traJson, key)
      }
      let buffer = xlsx.build([{ name: '简体中文', data }])
      fs.writeFileSync(filepath + path.sep + fileName, buffer, { flag: 'w' })
      resolve({
        data: path.join(filepath, fileName)
      })
    } catch (err) {
      reject(err)
    }
  })
}

const toJs = (url, filepath, fileName) => {
  return new Promise((resolve, reject) => {
    let code
    try {
      let res = fs.readFileSync(url.replace('/', path.sep))
      const data = xlsx.parse(res)[0].data // 第一个sheet
      data.shift() // 去除第一行，第一行是标题
      const jsonData = arrayToObject(data)
      code = `export default ${JSON.stringify(jsonData, '', 2).replace(/\"/g, "'")}\r\n`
      fs.access(path.join(filepath, fileName), fs.constants.F_OK, err => {
        if (!err) {
          fs.unlinkSync(filepath + path.sep + fileName)
        }
        fs.writeFileSync(filepath + path.sep + fileName, code, { flag: 'w' })
        resolve({
          data: path.join(filepath, fileName)
        })
      })
    } catch (err) {
      // 出错了
      reject(err)
    }
  })
}

module.exports = {
  toExcel,
  toJs
}

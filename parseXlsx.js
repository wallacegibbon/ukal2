const xlsx = require("node-xlsx")


const src = require("./src.json")

/**
 * @param {[string]} dataArr e.g. [ '0', 'ちかてつ', '地下鉄', '地铁', 4]
 * @returns {Object} e.g. { tone: '0', kana: 'ちかてつ', kanzi: '地下鉄',
 *    meaning: '地铁', unit: 4 }
 */
function buildRcd(dataArr) {
  const [ tone, kana, kanzi, meaning, unit ] = dataArr
  return { tone, kana, kanzi, meaning, unit }
}

function trimObj(obj) {
  return (typeof obj == 'string') ? obj.trim() : obj
}

function trimArray(objArr) {
  return objArr.map(trimObj)
}

function encodeStr(obj) {
  return (typeof obj == 'string') ? encodeURI(obj) : obj
}

function encodeItem(obj) {
  obj.kana = encodeStr(obj.kana)
  obj.kanzi = encodeStr(obj.kanzi)
  obj.meaning = encodeStr(obj.meaning)
  return obj
}

/**
 * @param {Object} kanzi e.g. { "kanzi": "中", "kana": "なか" }
 * @param {[Object]} table the data from excel table
 * @returns {[number]}
 */
function findIndexes(kanzi, table) {
  const result = []
  for (var i = 0; i < table.length; i++) {
    const x = table[i]
    if (x.kanzi && x.kanzi.indexOf(kanzi.kanzi) != -1 &&
        x.kana.indexOf(kanzi.kana) != -1) {
      result.push(i)
    }
  }
  return result
}

/**
 * Simply print the result to standard output.
 * @param {[Object]} src e.g. [{ "kanzi": "中", "kana": "なか" }, ...]
 * @param {[Object]} table the data from excel table
 */
function collectKanzi(src, table) {
  for (var x of src) {
    console.log(`${x.kanzi}[${x.kana}]\r`)
    const tgts = findIndexes(x, table)
    for (var x of tgts) {
      const d = table[x]
      console.log(`\t${d.kanzi}[${d.kana}](${d.tone || 0}) <${d.meaning}>\r`)
    }
  }
}


const tgtFile = process.argv[2]
if (!tgtFile) {
  console.error("target file is not specified.")
  process.exit(1)
}

const sheets = xlsx.parse(tgtFile)
const sheet = sheets[0].data.map(trimArray).map(buildRcd).slice(1)


const kanzi = process.argv[3]
if (kanzi != 'kanzi') {
  console.log(JSON.stringify(sheet.map(encodeItem)))
} else {
  collectKanzi(src, sheet)
}

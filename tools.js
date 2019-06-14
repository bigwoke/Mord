const fsp = require('fs').promises
const path = require('path')

async function getFiles (dir) {
  const files = await fsp.readdir(dir)
  return Promise.all(files
    .map(f => path.join(dir, f))
    .map(async f => {
      const stats = await fsp.stat(f)
      return stats.isDirectory() ? getFiles(f) : f
    }))
}

function flattenArray (arr, result = []) {
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i]

    if (Array.isArray(value)) {
      flattenArray(value, result)
    } else {
      result.push(value)
    }
  }
  return result
}

function getBotRoles (mord, msg) {
  if (msg.channel.type !== 'text') return null
  let roles = msg.guild.members.find(m => m.user.id === mord.user.id).roles

  roles = roles.sort((a, b) => {
    if (a.calculatedPosition < b.calculatedPosition) return -1
    if (a.calculatedPosition > b.calculatedPosition) return 1
    return 0
  })
  return roles
}

module.exports = {
  flatArray: flattenArray,
  getFiles: getFiles,
  getBotRoles: getBotRoles
}

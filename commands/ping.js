module.exports.run = async (mord, msg, args) => {
  msg.reply('Ping?').then(resp => {
    let lat = resp.createdTimestamp - msg.createdTimestamp
    resp.edit(`Pong! Effective latency is ${lat}ms. API latency is ~${Math.round(mord.ping)}ms.`)

    if (msg.channel.type === 'text') {
      resp.delete(3000)
      msg.delete(3000)
    }
  })
}

module.exports.info = {
  name: 'ping',
  usage: `${process.env.PREFIX}ping`,
  desc: 'Returns the total latency between you and Mord, and between Mord and API.',
  dm: true,
  permissions: 0
}

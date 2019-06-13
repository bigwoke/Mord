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
  desc: 'Returns the round-trip latency between the client and Mord, and between Mord and API.'
}

function onlyAsciiUpper(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9\s]/g, '')
    .trim()
    .toUpperCase()
}

function field(id, value) {
  const content = String(value || '')
  const length = String(content.length).padStart(2, '0')
  return `${id}${length}${content}`
}

function crc16(payload) {
  let crc = 0xffff

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8

    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }

      crc &= 0xffff
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function generatePixCopyPaste({
  pixKey,
  receiverName,
  city,
  amount,
  txid,
  description,
}) {
  const key = String(pixKey || '').trim()
  if (!key) {
    throw new Error('PIX key is required')
  }

  const merchantName = onlyAsciiUpper(receiverName || 'LOJA').slice(0, 25) || 'LOJA'
  const merchantCity = onlyAsciiUpper(city || 'SAO PAULO').slice(0, 15) || 'SAO PAULO'
  const txId = onlyAsciiUpper(txid || 'PEDIDO').slice(0, 25) || 'PEDIDO'
  const amountValue = Number(amount || 0).toFixed(2)

  const accountInfoFields = [
    field('00', 'BR.GOV.BCB.PIX'),
    field('01', key),
  ]

  const sanitizedDescription = onlyAsciiUpper(description || '').slice(0, 72)
  if (sanitizedDescription) {
    accountInfoFields.push(field('02', sanitizedDescription))
  }

  const payloadWithoutCrc = [
    field('00', '01'),
    field('26', accountInfoFields.join('')),
    field('52', '0000'),
    field('53', '986'),
    field('54', amountValue),
    field('58', 'BR'),
    field('59', merchantName),
    field('60', merchantCity),
    field('62', field('05', txId)),
    '6304',
  ].join('')

  const crc = crc16(payloadWithoutCrc)
  return `${payloadWithoutCrc}${crc}`
}

module.exports = {
  generatePixCopyPaste,
}

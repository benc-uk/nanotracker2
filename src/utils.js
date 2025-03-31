export function asHex(num) {
  if (num === undefined || num === null) {
    return '--'
  }

  return num.toString(16).padStart(2, '0')
}

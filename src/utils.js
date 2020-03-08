const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
const ymd = (t = new Date()) => t.toISOString().slice(0, 10)
const splitDate = (t = new Date()) => t.toISOString().split(/[^\d]/)
const fmtDateShort = dtStr => {
  if (typeof dtStr === 'undefined' || dtStr === '') return 'unknown'
  const [y, m, d] = splitDate(new Date(dtStr))
  return d + '-' + monthNames[m - 1]
}

export { ymd, splitDate, fmtDateShort }

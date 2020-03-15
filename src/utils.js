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
  const [y, m] = splitDate(new Date(dtStr))
  return d + '-' + monthNames[m - 1]
}
const fmtDate = dtStr => {
  if (typeof dtStr === 'undefined' || dtStr === '') return 'unknown'
  const [y, m, d] = splitDate(new Date(dtStr))
  return d + '-' + monthNames[m - 1] + '-' + y
}
function addDays(num, t1 = new Date()) {
  const t2 = new Date(t1)
  t2.setDate(t2.getDate() + num)
  return t2
}

function subDays(num, t1 = new Date()) {
  const t2 = new Date(t1)
  t2.setDate(t2.getDate() - num)
  return t2
}
function addHours(num, t1 = new Date()) {
  const t2 = new Date(t1)
  t2.setHours(t2.getHours() + num)
  return t2
}

function addMinutes(num, t1 = new Date()) {
  const t2 = new Date(t1)
  t2.setMinutes(t2.getMinutes() + num)
  return t2
}

export { ymd, splitDate, fmtDateShort, fmtDate, addDays, subDays, addHours, addMinutes }

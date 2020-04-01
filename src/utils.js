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
const dmy = (t = new Date()) =>
  t
    .getDate()
    .toString()
    .padStart(2, 0) +
  '-' +
  monthNames[t.getMonth()] +
  '-' +
  t.getFullYear()

const ymd = (t = new Date()) => t.toISOString().slice(0, 10)
const splitDate = (t = new Date()) => t.toISOString().split(/[^\d]/)
const fmtDateShort = dtStr => {
  if (typeof dtStr === 'undefined' || dtStr === '') return 'unknown'
  const [y, m, d] = splitDate(new Date(dtStr))
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

const getUTCDateInfo = dte => {
  const date = new Date(dte)
  return [
    date.getUTCDate(),
    date.getUTCMonth(),
    date.getUTCFullYear(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ]
}

function checkNested(obj, level, ...rest) {
  if (obj === undefined) return false
  if (rest.length == 0 && obj.hasOwnProperty(level)) return true
  return checkNested(obj[level], ...rest)
}

function getNested(obj, ...args) {
  return args.reduce((obj, level) => obj && obj[level], obj)
}

const decodeRecurRule = event => {
  if (event && event.recurrence) {
    const [recurrenceString] = event.recurrence
    return rrule.RRule.fromString(recurrenceString)
  } else {
    return ''
  }
}
const decodeRecurText = rule => rule.toText()

const parseRuleText = ruleString => rrule.RRule.parseString(ruleString)

const decodeRecurDates = (eventRule, dte) => {
  const newRule = new rrule.RRule({
    ...eventRule.origOptions,
    dtstart: new Date(dte)
  })
  // just return dd-mmm (max 5)
  const futureDates = newRule.all((date, i) => i < 6).map(dte => dmy(dte).slice(0, 6))
  return `${futureDates.join(', ')}${futureDates.length > 5 ? '...' : ''}`
}

export {
  dmy,
  ymd,
  splitDate,
  fmtDateShort,
  fmtDate,
  addDays,
  subDays,
  addHours,
  addMinutes,
  getUTCDateInfo,
  checkNested,
  getNested,
  decodeRecurRule,
  decodeRecurText,
  decodeRecurDates,
  parseRuleText
}

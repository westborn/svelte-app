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
  'Dec',
]

export const TIMES = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
]

export const FREQUENCIES = [
  'YEARLY',
  'MONTHLY',
  'WEEKLY',
  'DAILY',
  'HOURLY',
  'MINUTELY',
  'SECONDLY',
]
export const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6]
export const WEEKDAY_NAMES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

// export const dateToDMY = (t = new Date()) =>
//   t.getDate().toString().padStart(2, 0) +
//   '/' +
//   (t.getMonth() + 1).toString().padStart(2, 0) +
//   '/' +
//   t.getFullYear()

export const dateToYMD = (t = new Date()) =>
  t.getFullYear() +
  '-' +
  (t.getMonth() + 1).toString().padStart(2, 0) +
  '-' +
  t.getDate().toString().padStart(2, 0)

export const dmyToDate = (dteStr) => {
  var dateParts = dteStr.split('/')
  // month is 0-based, that's why we need dataParts[1] - 1
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
}

export const dmyToYMD = (dteStr) => {
  const [d, m, y] = dteStr.split(/[^\d]/)
  // console.log('dmyToYMD', m, typeof m)
  return `${y}-${m}-${d}`
}

export const ymd = (t = new Date()) => t.toLocaleString().slice(0, 10)

export const splitDate = (t = new Date()) => t.toLocaleString().split(/[^\d]/)

export const fmtDate = (dtStr) => {
  if (typeof dtStr === 'undefined' || dtStr === '') return 'unknown'
  const [d, m, y] = splitDate(new Date(dtStr))
  return d + '-' + monthNames[m - 1] + '-' + y
}
export const addDays = (num, t1 = new Date()) => {
  const t2 = new Date(t1)
  t2.setDate(t2.getDate() + num)
  return t2
}

export const subDays = (num, t1 = new Date()) => {
  const t2 = new Date(t1)
  t2.setDate(t2.getDate() - num)
  return t2
}
export const addHours = (num, t1 = new Date()) => {
  const t2 = new Date(t1)
  t2.setHours(t2.getHours() + num)
  return t2
}

export const addMinutes = (num, t1 = new Date()) => {
  const t2 = new Date(t1)
  t2.setMinutes(t2.getMinutes() + num)
  return t2
}

// export const getUTCDateInfo = (dte) => {
//   const date = new Date(dte)
//   return [
//     date.getUTCDate(),
//     date.getUTCMonth(),
//     date.getUTCFullYear(),
//     date.getUTCHours(),
//     date.getUTCMinutes(),
//     date.getUTCSeconds(),
//     date.getUTCMilliseconds(),
//   ]
// }

export const checkTimeInRange = (dte) => {
  // console.log(dte)
  const tmeText = `${dte
    .getHours()
    .toString()
    .padStart(2, 0)}:${dte.getMinutes().toString().padStart(2, 0)}`
  // console.log(tmeText)

  let res = TIMES[0]
  for (let index = 0; index < TIMES.length; index++) {
    if (tmeText >= TIMES[index]) res = TIMES[index]
  }
  // console.log(res)

  return res
}

export const decodeDateTime = (dateTime) => {
  //decode ISO date to YYYY-MM-DD AND TIME TO HH:MM - ready to display
  // console.log(`decode: ${dateTime}`)
  const dte = dateToYMD(dmyToDate(new Date(dateTime).toLocaleString().slice(0, 10)))
  const tme = checkTimeInRange(new Date(dateTime))
  // console.log(`decoded to: ${dte}, ${tme}`)
  return { dte, tme }
}

//this should convert YYYY-MM-DD date and time to UTC string using toISOString
export const encodeDateTime = (dte, tme) => {
  // console.log(`encode1: ${dte}, ${tme}`)
  if (dte === '' || tme === '') {
    // console.log(`encode2: ${dte}, ${tme}`)
    return '2020-01-01T00:00:00,000Z'
  }
  const localDateTime = new Date(dte)
  // console.log(`encode3: ${localDateTime}`)
  localDateTime.setHours(tme.slice(0, 2))
  localDateTime.setMinutes(tme.slice(3, 5))
  // console.log(`encode4: ${localDateTime}`)
  const tmp = localDateTime.toISOString()
  // console.log(`encode5: ${tmp}`)
  return tmp
}

export const checkNested = (obj, level, ...rest) => {
  if (obj === undefined) return false
  if (rest.length == 0 && obj.hasOwnProperty(level)) return true
  return checkNested(obj[level], ...rest)
}

export const getNested = (obj, ...args) => {
  return args.reduce((obj, level) => obj && obj[level], obj)
}

export const decodeRecurRule = (event) => {
  if (event && event.recurrence) {
    const [recurrenceString] = event.recurrence
    return rrule.RRule.fromString(recurrenceString)
  } else {
    return ''
  }
}
export const decodeRecurText = (rule) => rule.toText()

export const parseRuleText = (ruleString) => rrule.RRule.parseString(ruleString)

export const decodeRecurDates = (eventRule, dte = new Date()) => {
  // console.log(`decodeDates: ${JSON.stringify(eventRule, null, 2)}`)
  const newRule = new rrule.RRule({
    ...eventRule.origOptions,
    dtstart: new Date(dte),
  })
  // just return dd-mmm (max 5)
  const futureDates = newRule
    .all((date, i) => i < 6)
    .map((dte) => fmtDate(new Date(dte)).slice(0, 6))
  return `${futureDates.join(', ')}${futureDates.length > 5 ? '...' : ''}`
}

export const validateRule = (options) => {
  // console.log(`validateRule1: ${JSON.stringify(options, null, 2)}`)
  // console.log(rrule.RRule.DAILY)
  // const newRule = new rrule.RRule({ ...options }, { wkst: { weekday: 6 } })
  const newRule = new rrule.RRule(options)
  return { ruleText: newRule.toText(), ruleString: newRule.toString() }
}

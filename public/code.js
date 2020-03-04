function doGet(e) {
  var url =
    'https://docs.google.com/spreadsheets/d/1mIYWQJkGhMZmh6pW7VV11ivjftcNloNlxvOgQ6_21yw/edit#gid=0'

  //get the next "Start of Term" date
  ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName('Options')
  var values = getColByName('StartDate', ws)

  // find the next start of term date
  var today = new Date()
  var startDate = today
  for (var i = 0; i < 4; i++) {
    var val = values[i]
    if (val[0] > today) {
      startDate = val[0]
      break
    }
  }
  return HtmlService.createTemplateFromFile('index.hml', { startDate: startDate }).evaluate()
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getcontent()
}

function getColByName(colName, sheet) {
  var data = sheet.getRange('A1:1').getValues()
  var col = data[0].indexOf(colName)
  if (col != -1) {
    return sheet.getRange(2, col + 1, sheet.getLastRow() - 1).getValues()
  }
}

function getList(colName) {
  ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName('Options')
  var values = getColByName(colName, ws)
  var listObj = {}
  values.forEach(function(value) {
    if (value[0] !== '') {
      listObj[value[0]] = null
    }
  })
  return listObj
}

function getEventList(data) {
  var selectedDate = new Date(data.date)
  console.log(selectedDate)
  var events = listUpcomingEvents(selectedDate)
  console.log(events)
  return events
}

/**
 * return 10 upcoming events from the user's calendar.
 */
function listUpcomingEvents(startDate) {
  //  var calendarId = 'sv3qe35g5jv5lv2n6o10bfi7h0@group.calendar.google.com'; //U3A Draft
  var calendarId = 'm91ia24s7mq0tlm98rbrn31qmk@group.calendar.google.com' // GS Tsey
  var optionalArgs = {
    timeMin: new Date(startDate).toISOString(),
    showDeleted: false,
    singleEvents: true,
    maxResults: 10,
    orderBy: 'startTime'
  }
  var response = Calendar.Events.list(calendarId, optionalArgs)
  var events = response.items
  var result = []
  if (events.length > 0) {
    for (i = 0; i < events.length; i++) {
      var event = events[i]
      var when = event.start.dateTime
      if (!when) {
        when = event.start.date
      }
      result.push({ title: event.summary, startTime: when })
    }
  }
  return result
}

function addEvent(event) {
  console.log('Add Event:\n')
  console.log(event)
}

function findCalendarByName(name) {
  var calendars = CalendarApp.getCalendarsByName('U3A draft bookings')
  var cal = calendars[0]
  console.log(cal.getName())
  console.log(cal.getDescription())
  console.log(cal.getId())
  console.log(cal.getTimeZone())
}

function getEvents(req) {
  //  var calendarId = 'sv3qe35g5jv5lv2n6o10bfi7h0@group.calendar.google.com';
  var calendarId = 'm91ia24s7mq0tlm98rbrn31qmk@group.calendar.google.com' // GS Test
  //  console.log(req)
  var events = Calendar.Events.list(calendarId, req).items
  return JSON.stringify(events)
}

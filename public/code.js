function doGet(e) {
  return HtmlService.createTemplateFromFile('claspIndex.html').evaluate()
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()
}

function codeGetDates() {
  var url =
    'https://docs.google.com/spreadsheets/d/1mIYWQJkGhMZmh6pW7VV11ivjftcNloNlxvOgQ6_21yw/edit#gid=0'

  //get the term dates
  ss = SpreadsheetApp.openByUrl(url)
  var ws = ss.getSheetByName('Options')
  // first five rows, 3 columns
  var values = ws.getRange(1, 1, 5, 3).getValues()
  obj = getJsonArrayFromData(values)
  return JSON.stringify(obj)
}

function codeGetEvents(req) {
  //  var calendarId = 'sv3qe35g5jv5lv2n6o10bfi7h0@group.calendar.google.com';
  var calendarId = 'm91ia24s7mq0tlm98rbrn31qmk@group.calendar.google.com' // GS Test
  console.log(req)
  var events = extractCalendarDetails(Calendar.Events.list(calendarId, req).items)
  return JSON.stringify(events)
}

/************************************************************************
 *
 * Gets the last row number based on a selected column range values
 *
 * @param {array} range : takes a 2d array of a single column's values
 *
 * @returns {number} : the last row number with a value.
 *
 */

function getLastRowSpecial(range) {
  var rowNum = 0
  var blank = false
  for (var row = 0; row < range.length; row++) {
    if (range[row][0] === '' && !blank) {
      rowNum = row
      blank = true
    } else if (range[row][0] !== '') {
      blank = false
    }
  }
  return rowNum
}

function getJsonArrayFromData(data) {
  var obj = {}
  var result = []
  var headers = data[0]
  var cols = headers.length
  var row = []

  for (var i = 1, l = data.length; i < l; i++) {
    // get a row to fill the object
    row = data[i]
    // clear object
    obj = {}
    for (var col = 0; col < cols; col++) {
      // fill object with new values
      obj[headers[col]] = row[col]
    }
    // add object in a final result
    result.push(obj)
  }

  return result
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

const getDateUTC = dteStr => {
  return new Date(dteStr).toISOString()
}
//Compare dates from Google Calendar API
const comp = (a, b) =>
  new Date(a.start.dateTime || a.start.date).getTime() -
  new Date(b.start.dateTime || b.start.date).getTime()

//Get all necessary data (dates, location, summary, description) and creates object for render
function extractCalendarDetails(data) {
  var result = []

  //Remove cancelled events, sort by date
  var resultFiltered = data
    .filter(item => item && item.hasOwnProperty('status') && item.status !== 'cancelled')
    .sort(comp)
    .reverse()

  resultFiltered.forEach(element => {
    var event = {
      id: '',
      summary: '',
      description: '',
      location: '',
      isAllDayEvent: false,
      startDateTime: '',
      endDateTime: '',
      recurrence: [],
      extendedProperties: {}
    }
    event.id = element.id || ''
    event.summary = element.summary || ''
    event.description = element.description || ''
    event.location = element.location || ''
    event.recurrence = element.recurrence || ''
    event.startDateTime = getDateUTC(element.start.dateTime || element.start.date)
    event.endDateTime = getDateUTC(element.end.dateTime || element.end.date)

    //check for event that doesn't have any times (all day event)
    event.isAllDayEvent = element.start && element.start.date && element.end.date ? true : false
    result.push(event)
  })
  return result
}

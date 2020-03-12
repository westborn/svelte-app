<script>
  import { onMount } from 'svelte'
  import { splitDate, fmtDateShort } from '../utils'

  export let events

  let calendarEntries = [
    {
      summary: '',
      description: '',
      location: '',
      isAllDayEvent: false,
      startDateTime: '',
      endDateTime: '',
      recurrence: [],
      extendedProperties: {}
    }
  ]

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

  onMount(() => {
    calendarEntries = extractCalendarDetails(events)
  })
</script>

<!-- <ul>
  {#each calendarEntries as event}
    <li>{fmtDateShort(event.startDateTime)} - {event.summary}</li>
  {/each}
</ul> -->

{#each calendarEntries as event}
  <option value={event.id}>{fmtDateShort(event.startDateTime)} - {event.summary}</option>
{/each}

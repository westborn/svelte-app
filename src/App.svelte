<script>
  import { onMount } from 'svelte'

  import Terms from './components/Terms.svelte'
  import Event from './components/Event.svelte'
  import EventForm from './components/EventForm.svelte'

  import { parseRuleText } from './utils'

  import { EVENTS, TERMS, PRESENTERS, VENUES, CONTACTS, CALENDARS } from './DATA.js'

  const LOCAL = false

  // ============================================================================
  const populateVenues = data => {
    data.forEach((item, idx) => venues.push({ id: idx, name: item }))
  }
  const populatePresenters = data => {
    data.forEach((item, idx) => presenters.push({ id: idx, name: item }))
  }
  const populateContacts = data => {
    data.forEach((item, idx) => contacts.push({ id: idx, name: item }))
  }

  const populateCalendars = data => {
    data.forEach(el => calendars.push({ id: el.id, name: el.summary }))
    calendars = calendars ? [...calendars] : [{ id: 0, name: 'not yet' }]
    selectedCalendarId = calendars[0].id
  }

  onMount(() => {
    if (LOCAL) {
      populateCalendars(CALENDARS)
      calendars = calendars ? [...calendars] : [{ id: 0, name: 'not yet' }]
      selectedCalendarId = calendars[0].id
    } else {
      google.script.run.withSuccessHandler(populateCalendars).getCalendarList()
    }
  })

  const doIninitialise = () => {
    if (LOCAL) {
      populatePresenters(PRESENTERS)
      populateVenues(VENUES)
      populateContacts(CONTACTS)
      showDates(TERMS)
      showEvents(EVENTS)
      return
    } else {
      google.script.run.withSuccessHandler(populateVenues).getList('venues')
      google.script.run.withSuccessHandler(populatePresenters).getList('presenters')
      google.script.run.withSuccessHandler(populateContacts).getList('contacts')
      google.script.run.withSuccessHandler(showDates).codeGetDates()
    }
  }
  const showDates = sheetTerms => {
    terms = JSON.parse(sheetTerms)
    var payload = {
      calendarId: selectedCalendarId,
      req: {
        singleEvents: false,
        timeMin: '2019-10-23T10:00:00-07:00',
        timeMax: '2020-06-30T10:00:00-07:00'
      }
    }
    if (!LOCAL) {
      // console.log('calling showEvents')
      google.script.run.withSuccessHandler(showEvents).codeGetEvents(payload)
    }
  }

  const showEvents = sheetEvents => {
    const comp = (a, b) => new Date(a.startdateTime).getTime() - new Date(b.startdateTime).getTime()
    // console.log('inside showEvents')
    // console.log(sheetEvents)
    events = JSON.parse(sheetEvents)
      .sort(comp)
      .reverse()
    initialised = true
  }
  // CRUD functions (calling and returning)
  const create = () => {
    formType = 'create'
    allowEventdisplay = true
    formEvent = undefined
  }
  const createEvent = event => {
    console.log('Ready to Create')
    console.log(JSON.stringify(event, null, 2))
    allowEventdisplay = false
    formType = ''
  }
  const update = () => {
    formType = 'update'
    allowEventdisplay = true
    event = events.find(event => event.id === eventId)
  }
  const updateEvent = event => {
    console.log('Ready to Update')
    console.log(JSON.stringify(event, null, 2))
    const returnEvent = {
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startDateTime,
        timeZone: 'Australia/Sydney'
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'Australia/Sydney'
      },
      recurrence: event.recurrence ? [event.recurrence] : [],
      extendedProperties: { ...event.extendedProperties }
    }
    console.log(JSON.stringify(returnEvent, null, 2))
    //TODO show loader
    google.script.run.withSuccessHandler(afterUpdate).codeUpdateEvent(returnEvent)
  }
  const afterUpdate = payload => {
    formType = ''
    allowEventdisplay = false
    showEvents(payload)
    //TODO show loader
  }

  const remove = () => {
    formType = 'remove'
    allowEventdisplay = true
    event = events.find(event => event.id === eventId)
  }
  const removeEvent = event => {
    console.log('Ready to Remove')
    console.log(JSON.stringify(event, null, 2))
    formType = ''
    allowEventdisplay = false
  }

  // select box data from spreadsheet
  let presenters = []
  let venues = []
  let contacts = []
  let calendars = []
  let selectedCalendarId = ''

  // Reactive for term fields
  let terms = []
  let termIndex = 0

  // Reactive for events
  let events = []
  let allowEventdisplay = false
  let event = {}
  let eventId = ''
  let formEvent = {}

  let initialised = false
  let formType = ''
</script>

<style>
  button:disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.2);
  }

  .input-field {
    margin: 4rem;
    width: 15rem;
  }
</style>

<div class="container">

  {#if initialised}
    <Terms
      on:message={e => {
        termIndex = e.detail.termIndex
      }}
      {terms}
      disabled={allowEventdisplay} />

    <p>{`App: eventId = ${eventId}`}</p>

    <Event
      on:message={e => {
        eventId = e.detail.eventId
      }}
      {events}
      disabled={allowEventdisplay} />

    <!-- <p>{`selectedId = ${selectedId}`}</p> -->

    <div class="my-2">
      <button class="btn" on:click={create} disabled={allowEventdisplay}>Add New Course</button>
      <button class="btn" on:click={update} disabled={allowEventdisplay || eventId === ''}>
        Update Selected Course
      </button>
      <button class="btn" on:click={remove} disabled={allowEventdisplay || eventId === ''}>
        Delete Selected Course
      </button>
    </div>

    {#if formType != ''}
      <div class="">
        <EventForm
          {formType}
          {event}
          {presenters}
          {venues}
          {contacts}
          on:eventCancel={() => {
            formType = ''
            allowEventdisplay = false
          }}
          on:eventCreate={e => {
            createEvent(e.detail.event)
          }}
          on:eventUpdate={e => {
            updateEvent(e.detail.event)
          }}
          on:eventRemove={e => {
            removeEvent(e.detail.event)
          }} />
      </div>
    {/if}
    <!-- <!-- <pre>{JSON.stringify(terms[termIndex], null, 2)}</pre> -->
    <!-- <pre>{JSON.stringify(events.filter(event => event.id === eventId), null, 2)}</pre> -->
  {:else}
    <div class="input-field">
      <select bind:value={selectedCalendarId}>
        {#each calendars as { id, name }}
          <option value={id}>{name}</option>
        {/each}
      </select>
      <label>Choose the Courses Calendar</label>

    </div>
    <button class="btn" on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
  <!-- <pre>{JSON.stringify(event, null, 2)}</pre> -->

</div>

<script>
  import Terms from './components/Terms.svelte'
  import Event from './components/Event.svelte'
  import EventForm from './components/EventForm.svelte'

  import { parseRuleText } from './utils'

  import { EVENTS, TERMS, PRESENTERS, VENUES, CONTACTS } from './DATA.js'

  const LOCAL = true

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

  const doIninitialise = () => {
    if (LOCAL) {
      populatePresenters(PRESENTERS)
      populateVenues(VENUES)
      populateContacts(CONTACTS)
      showDates(TERMS)
      showEvents(EVENTS)
      return
    } else {
      // console.log('calling showDates')
      google.script.run.withSuccessHandler(populateVenues).getList('venues')
      google.script.run.withSuccessHandler(populatePresenters).getList('presenters')
      google.script.run.withSuccessHandler(populateContacts).getList('contacts')
      google.script.run.withSuccessHandler(showDates).codeGetDates()
    }
  }
  const showDates = sheetTerms => {
    terms = JSON.parse(sheetTerms)
    var req = {
      singleEvents: false,
      timeMin: '2019-10-23T10:00:00-07:00',
      timeMax: '2020-04-30T10:00:00-07:00'
    }
    if (!LOCAL) {
      // console.log('calling showEvents')
      google.script.run.withSuccessHandler(showEvents).codeGetEvents(req)
    }
  }
  const showEvents = sheetEvents => {
    // console.log('inside showEvents')
    // console.log(sheetEvents)
    events = JSON.parse(sheetEvents)
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
    console.log(event)
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
    console.log(event)
    formType = ''
    allowEventdisplay = false
  }
  const remove = () => {
    formType = 'remove'
    allowEventdisplay = true
    event = events.find(event => event.id === eventId)
  }
  const removeEvent = event => {
    console.log('Ready to Remove')
    console.log(event)
    formType = ''
    allowEventdisplay = false
  }

  // select box data from spreadsheet
  let presenters = []
  let venues = []
  let contacts = []

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

  let test = null

  // $: test =
  //   selectedEvent && selectedEvent.recurrence
  //     ? rrule.RRule.parseString(selectedEvent.recurrence)
  //     : null
  //
  // $: test = selectedEvent
  //   ? selectedEvent.recurrence.length > 0
  //     ? rrule.RRule.parseString(selectedEvent.recurrence)
  //     : 'empty'
  //   : 'not there'
  // let test = recurrence !== '' ? rrule.RRule.parseString(recurrence) : ''
  // let test = new rrule.RRule({
  //   freq: rrule.RRule.WEEKLY,
  //   // interval: 0,
  //   byweekday: [rrule.RRule.MO, rrule.RRule.FR],
  //   dtstart: new Date(Date.UTC(2012, 1, 1, 10, 30)),
  //   until: new Date(Date.UTC(2012, 12, 31))
  // }).toText()
</script>

<style>
  button:disabled {
    cursor: not-allowed;
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
        const [test2] = events && eventId ? events.find(event => event.id === eventId).recurrence : null
        test = test2 ? parseRuleText(test2) : null
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
    <button class="btn" on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
  <pre>{JSON.stringify(test, null, 2)}</pre>

</div>

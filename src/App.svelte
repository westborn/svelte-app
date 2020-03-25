<script>
  import Terms from './components/Terms.svelte'
  import Event from './components/Event.svelte'
  import EventForm from './components/EventForm.svelte'
  import { EVENTS, TERMS, PRESENTERS, VENUES, CONTACTS } from './DATA.js'
  import { splitDate, fmtDate, dmy } from './utils'

  const LOCAL = true

  function populateVenues(data) {
    data.forEach((item, idx) => venues.push({ id: idx, name: item }))
  }
  function populatePresenters(data) {
    data.forEach((item, idx) => presenters.push({ id: idx, name: item }))
  }
  function populateContacts(data) {
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

  // select box data from spreadsheet
  let presenters = []
  let venues = []
  let contacts = []

  // Reactive for term fields
  let terms = []
  let termIndex = 0

  let events = []
  let allowEventdisplay = false
  let event = {}
  let eventId = ''
  let formEvent = {}

  let initialised = false

  let formType = ''

  function create() {
    formType = 'create'
    allowEventdisplay = true
    formEvent = undefined
  }
  function createEvent(event) {
    console.log('Ready to Create')
    console.log(event)
    allowEventdisplay = false
    formType = ''
  }

  function update() {
    formType = 'update'
    allowEventdisplay = true
    event = events.find(event => event.id === eventId)
  }
  function updateEvent(event) {
    console.log('Ready to Update')
    console.log(event)
    formType = ''
    allowEventdisplay = false
  }

  function remove() {
    formType = 'remove'
    allowEventdisplay = true
    event = events.find(event => event.id === eventId)
  }
  function removeEvent(event) {
    console.log('Ready to Remove')
    console.log(event)
    formType = ''
    allowEventdisplay = false
  }
</script>

<style>
  button {
    cursor: pointer;
  }
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

    <p>{`eventId = ${eventId}`}</p>

    <Event
      on:message={e => {
        eventId = e.detail.eventId
      }}
      {events}
      disabled={allowEventdisplay} />

    <!-- <p>{`selectedId = ${selectedId}`}</p> -->

    <div class="buttons mt-2">
      <button on:click={create} disabled={allowEventdisplay}>Add New Course</button>
      <button on:click={update} disabled={allowEventdisplay || eventId === ''}>
        Update Selected Course
      </button>
      <button on:click={remove} disabled={allowEventdisplay || eventId === ''}>
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
    <button on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
</div>

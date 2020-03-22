<script>
  import Terms from './components/Terms.svelte'
  import Event from './components/Event.svelte'
  import EventForm from './components/EventForm.svelte'
  import { EVENTS, TERMS } from './DATA.js'
  import { splitDate, fmtDate, dmy } from './utils'

  const LOCAL = true

  function populateVenues(venues) {
    console.log(venues)
  }
  function populatePresenters(presenters) {
    console.log(presenters)
  }
  function populateContacts(contacts) {
    console.log(contacts)
  }

  const doIninitialise = () => {
    if (LOCAL) {
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

  // Reactive for term fields
  let terms = []
  let termIndex = 0

  let events = []
  let event = {}
  let eventId = ''
  let formEvent = {}

  let initialised = false

  let formType = ''

  function create() {
    formType = 'create'
    formEvent = undefined
  }
  function createEvent(event) {
    console.log('Ready to Create')
    formType = ''
  }

  function update() {
    formType = 'update'
    event = events.filter(event => event.id === eventId)
  }
  function updateEvent(event) {
    formType = ''
    console.log('Ready to Update')
  }

  function remove() {
    formType = 'remove'
    event = { id: eventId }
  }
  function removeEvent(event) {
    formType = ''
    console.log('Ready to Remove')
  }
</script>

<style>

</style>

<div class="container">

  {#if initialised}
    <Terms
      on:message={e => {
        termIndex = e.detail.termIndex
      }}
      {terms} />

    <p>{`eventId = ${eventId}`}</p>

    <Event
      on:message={e => {
        eventId = e.detail.eventId
      }}
      {events} />

    <!-- <p>{`selectedId = ${selectedId}`}</p> -->

    <div class="buttons mt-2">
      <button on:click={create} disabled={formType === 'create'}>Create</button>
      <button on:click={update} disabled={formType === 'update'}>Update</button>
      <button on:click={remove} disabled={formType === 'remove'}>Delete</button>
    </div>

    {#if formType != ''}
      <div class="">
        <EventForm
          {formType}
          {formEvent}
          on:eventCreate={e => {
            event = e.detail.event
            console.log('Created')
            createEvent(event)
          }}
          on:eventUpdate={e => {
            event = e.detail.event
            console.log('Updated')
            updateEvent(event)
          }}
          on:eventRemove={e => {
            event = e.detail.event
            console.log('Removed')
            removeEvent(event)
          }} />
      </div>
    {/if}
    <!-- <!-- <pre>{JSON.stringify(terms[termIndex], null, 2)}</pre> -->
    <pre>{JSON.stringify(events.filter(event => event.id === eventId), null, 2)}</pre>
  {:else}
    <button on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
</div>

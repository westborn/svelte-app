<script>
  import Terms from './components/Terms.svelte'
  import { EVENTS, TERMS } from './DATA.js'
  import { splitDate, fmtDate } from './utils'

  const LOCAL = true

  const doIninitialise = () => {
    if (LOCAL) {
      showDates(TERMS)
      showEvents(EVENTS)
      var elems = document.querySelectorAll('select')
      console.log(elems)
      var instances = M.FormSelect.init(elems)

      return
    } else {
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
      google.script.run.withSuccessHandler(showEvents).codeGetEvents(req)
    }
  }
  const showEvents = sheetEvents => {
    // console.log(sheetEvents)
    events = JSON.parse(sheetEvents)
    initialised = true
  }

  // Reactive for term fields
  let terms = []
  let termIndex = 0

  let events = []
  let filterValue = ''
  let selectedId = ''

  let summary = ''
  let description = ''
  let location = ''
  let isAllDayEvent = false
  let startDateTime = ''
  let endDateTime = ''
  let recurrence = []
  let extendedProperties = {}

  $: filteredEvents = filterValue
    ? events.filter(event => {
        const eventLine = `${fmtDate(event.startDateTime)} - ${event.summary}`
        return eventLine.toLowerCase().match(filterValue.toLowerCase())
      })
    : events

  $: selectedEvent = filteredEvents.filter(event => event.id === selectedId)

  $: reset_inputs(selectedEvent[0])
  // ======================================================
  let people = [
    { first: 'Hans', last: 'Emil' },
    { first: 'Max', last: 'Mustermann' },
    { first: 'Roman', last: 'Tisch' }
  ]

  let initialised = false

  let first = ''
  let last = ''
  let i = ''

  $: filteredPeople = filterValue
    ? people.filter(person => {
        const name = `${person.last}, ${person.first}`
        return name.toLowerCase().match(filterValue.toLowerCase())
      })
    : people

  $: selected = filteredPeople[i]

  function create() {
    people = people.concat({ first, last })
    i = people.length - 1
    first = last = ''
  }

  function update() {
    selected.first = first
    selected.last = last
    console.log(i)
    people = people
  }

  function remove() {
    // Remove selected person from the source array (people), not the filtered array
    const index = people.indexOf(selected)
    people = [...people.slice(0, index), ...people.slice(index + 1)]

    first = last = ''
    i = Math.min(i, filteredPeople.length - 2)
  }

  function reset_inputs(event) {
    console.log(`Event 106: ${event}`)
    summary = event ? event.summary : ''
    startDateTime = event ? fmtDate(event.startDateTime) : ''
    description = event ? event.description : ''
    location = event ? event.location : ''
    recurrence = event ? event.recurrence[0] : ''
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
    <p>{`selectedId = ${selectedId}`}</p>

    <input class="my-2" placeholder="Course filter" bind:value={filterValue} />

    <label>Select a Course</label>
    <select bind:value={selectedId} size={filteredEvents.length}>
      {#each filteredEvents as event}
        <option value={event.id}>{fmtDate(event.startDateTime)} - {event.summary}</option>
      {/each}
    </select>

    <div class="input-container my-2">
      <input type="text" bind:value={summary} required="" />
      <label>Summary</label>
    </div>

    <div class="input-container">
      <input type="text" bind:value={startDateTime} required="" />
      <label>Start Date</label>
    </div>

    <div class="input-container">
      <textarea bind:value={description} required="" rows="4" />
      <label>Description</label>
    </div>

    <div class="input-container">
      <input type="text" bind:value={location} required="" />
      <label>Location</label>
    </div>

    <div class="input-container">
      <input type="text" bind:value={recurrence} required="" />
      <label>Recurrence</label>
    </div>

    <div class="buttons">
      <button on:click={create} disabled={!first || !last}>create</button>
      <button on:click={update} disabled={!first || !last || !selected}>update</button>
      <button on:click={remove} disabled={!selected}>delete</button>
    </div>

    <pre>{JSON.stringify(terms[termIndex], null, 2)}</pre>
    <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
  {:else}
    <button on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
</div>

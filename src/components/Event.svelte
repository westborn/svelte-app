<script>
  import { createEventDispatcher } from 'svelte'
  import { fmtDate, dmy, getNested, checkNested, decodeRecurRule, decodeRecurText } from '../utils'

  const dispatch = createEventDispatcher()

  export let events = []
  export let disabled

  const resetInputs = event => {
    selectedId = event ? event.id : ''
    summary = event ? event.summary : ''
    startDateTime = event ? fmtDate(event.startDateTime) : ''
    description = event ? event.description : ''
    location = event ? event.location : ''
    //destructure first element from recurrence array on the event
    ;[recurrence] = event && event.recurrence.length > 0 ? event.recurrence : ''
    contact = checkNested(event, 'extendedProperties', 'private', 'contact')
      ? getNested(event, 'extendedProperties', 'private', 'contact')
      : ''
    presenter = checkNested(event, 'extendedProperties', 'private', 'presenter')
      ? getNested(event, 'extendedProperties', 'private', 'presenter')
      : ''
    minMaxCost =
      checkNested(event, 'extendedProperties', 'private', 'min') &&
      checkNested(event, 'extendedProperties', 'private', 'max') &&
      checkNested(event, 'extendedProperties', 'private', 'cost')
        ? `${getNested(event, 'extendedProperties', 'private', 'min')} /
           ${getNested(event, 'extendedProperties', 'private', 'max')} /
           ${getNested(event, 'extendedProperties', 'private', 'cost')}`
        : ''
  }

  let selectedId = ''
  $: {
    dispatch('message', { eventId: selectedId })
  }
  let filterValue = ''

  let summary = ''
  let description = ''
  let location = ''
  let startDateTime = ''
  let recurrence = ''
  let contact = ''
  let presenter = ''
  let minMaxCost = ''

  $: filteredEvents = filterValue
    ? events.filter(event => {
        const eventLine = `${fmtDate(event.startDateTime)} - ${event.summary}`
        return eventLine.toLowerCase().match(filterValue.toLowerCase())
      })
    : events

  $: selectedEvent = filteredEvents.find(event => event.id === selectedId)
  $: recurRule = decodeRecurRule(selectedEvent)
  $: recurText = recurRule ? decodeRecurText(recurRule) : ''

  $: resetInputs(selectedEvent)
</script>

<style>
  .layout {
    display: grid;
    width: 90%;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .grid-text {
    display: grid;
    grid-template-columns: minmax(0, 7em) 1fr;
    gap: 0rem;
    grid-column-start: 2;
  }

  .field-name {
    color: var(--mid-gray);
  }
  select {
    cursor: pointer;
  }
  select:disabled {
    cursor: not-allowed;
  }
  input {
    cursor: text;
  }
  input:disabled {
    cursor: not-allowed;
  }
</style>

<div class="layout">

  <input {disabled} class="col-1 my-1" placeholder="Course filter" bind:value={filterValue} />

  <select
    {disabled}
    class="select col-1"
    bind:value={selectedId}
    size={filteredEvents.length < 5 ? 5 : 20}>
    <option value="" disabled>Select a Course</option>
    {#each filteredEvents as event}
      <option value={event.id}>{fmtDate(event.startDateTime)} - {event.summary}</option>
    {/each}
  </select>

  <div class="grid-text">
    <p class="col-1 field-name">Summary:</p>
    <p class="col-2">{summary}</p>
    <p class="col-1 field-name">Starting:</p>
    <p class="col-2">{startDateTime}</p>
    <p class="col-1 field-name">Description:</p>
    <p class="col-2">{description}</p>
    <p class="col-1 field-name">Location:</p>
    <p class="col-2">{location}</p>
    <p class="col-1 field-name">Presenter:</p>
    <p class="col-2">{presenter}</p>
    <p class="col-1 field-name">Contact:</p>
    <p class="col-2">{contact}</p>
    <p class="col-1 field-name">Min/Max/Cost:</p>
    <p class="col-2">{minMaxCost}</p>
    <p class="col-1 field-name">Recurs:</p>
    <p class="col-2">{recurText}</p>
    <p class="col-1" style="font-size: .8rem">{recurRule}</p>
  </div>
</div>
<!-- <pre>{JSON.stringify(selectedEvent, null, 2)}</pre> -->

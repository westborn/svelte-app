<script>
  import { createEventDispatcher } from 'svelte'
  import { fmtDate, dmy, getNested, checkNested } from '../utils'

  const dispatch = createEventDispatcher()

  const decodeRecurRule = event => {
    if (event[0] && event[0].recurrence) {
      return rrule.RRule.fromString(event[0].recurrence[0])
    } else {
      return ''
    }
  }
  const decodeRecurText = rule => rule.toText()

  const decodeRecurDates = (eventRule, event) => {
    const newRule = new rrule.RRule({
      ...eventRule.origOptions,
      dtstart: new Date(event[0].startDateTime)
    })
    const futureDates = newRule.all((date, i) => i < 6).map(dte => dmy(dte))
    return `${futureDates.join(', ')}${futureDates.length > 5 ? '...' : ''}`
  }

  const resetInputs = event => {
    selectedId = event ? event.id : ''
    summary = event ? event.summary : ''
    startDateTime = event ? fmtDate(event.startDateTime) : ''
    description = event ? event.description : ''
    location = event ? event.location : ''
    recurrence = event && event.recurrence[0] ? event.recurrence[0] : ''
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

  export let events = []
  $: {
    dispatch('message', { eventId: selectedId })
  }
  export let disabled

  let filterValue = ''
  let selectedId = ''

  let summary = ''
  let description = ''
  let location = ''
  let startDateTime = ''
  let recurrence = []
  let contact = ''
  let presenter = ''
  let minMaxCost = ''

  $: filteredEvents = filterValue
    ? events.filter(event => {
        const eventLine = `${fmtDate(event.startDateTime)} - ${event.summary}`
        return eventLine.toLowerCase().match(filterValue.toLowerCase())
      })
    : events

  $: selectedEvent = filteredEvents.filter(event => event.id === selectedId)
  $: recurRule = decodeRecurRule(selectedEvent)
  $: recurText = recurRule ? decodeRecurText(recurRule) : ''
  $: recurDates = recurRule ? decodeRecurDates(recurRule, selectedEvent) : ''

  $: resetInputs(selectedEvent[0])
</script>

<style>
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0rem;
  }
  .grid-text {
    display: grid;
    grid-template-columns: minmax(0, 7em) 1fr;
    grid-gap: 0rem;
    grid-column-start: 2;
  }
  .col-1 {
    grid-column-start: 1;
  }
  .col-2 {
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

<div class="grid-2">

  <input {disabled} class="col-1 my-2" placeholder="Course filter" bind:value={filterValue} />

  <select
    {disabled}
    class="select col-1"
    bind:value={selectedId}
    size={filteredEvents.length < 5 ? 5 : filteredEvents.length + 1}>
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
  </div>
</div>

<!-- {#if recurRule}
  <p>Recurrence: {recurrence}</p>
  <p>Recurring : {recurDates}</p>
{/if}

<pre>{JSON.stringify(selectedEvent, null, 2)}</pre> -->

<!--
  <div class="input-container col-2">
    <input type="text" bind:value={summary} />
    <label>Summary</label>
  </div>

  <div class="input-container col-2">
    <input type="text" bind:value={startDateTime} />
    <label>Start Date</label>
  </div>

  <div class="input-container col-2">
    <textarea bind:value={description} rows="4" />
    <label>Description</label>
  </div>

  <div class="input-container col-2">
    <input type="text" bind:value={location} />
    <label>Location</label>
  </div>

  <div class="input-container col-2">
    <input type="text" bind:value={recurText} />
    <label>Recurrence</label>
  </div> -->

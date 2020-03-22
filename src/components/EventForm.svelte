<script>
  import { createEventDispatcher } from 'svelte'
  import { fmtDate, dmy, getNested, checkNested } from '../utils'

  const dispatch = createEventDispatcher()

  export let event = {}
  export let formType = ''

  const decodeRecurDates = (eventRule, dte) => {
    const newRule = new rrule.RRule({
      ...eventRule.origOptions,
      dtstart: new Date(dte)
    })
    const futureDates = newRule.all((date, i) => i < 6).map(dte => dmy(dte))
    return `${futureDates.join(', ')}${futureDates.length > 5 ? '...' : ''}`
  }

  const addNewEvent = () => {
    addedEvent.summary = summary
    addedEvent.description = description
    addedEvent.location = location
    addedEvent.isAllDayEvent = true
    addedEvent.startDateTime = startDateTime
    addedEvent.endDateTime = startDateTime
    addedEvent.recurrence = recurrence
    addedEvent.extendedProperties.private.presenter = presenter
    addedEvent.extendedProperties.private.contact = contact
    addedEvent.extendedProperties.private.min = minEnrol
    addedEvent.extendedProperties.private.max = maxEnrol
    addedEvent.extendedProperties.private.cost = cost
    dispatch('eventCreate', { event: addedEvent })
  }

  const updateEvent = () => {
    addedEvent.summary = summary
    addedEvent.description = description
    addedEvent.location = location
    addedEvent.isAllDayEvent = true
    addedEvent.startDateTime = startDateTime
    addedEvent.endDateTime = startDateTime
    addedEvent.recurrence = recurrence
    addedEvent.extendedProperties.private.presenter = presenter
    addedEvent.extendedProperties.private.contact = contact
    addedEvent.extendedProperties.private.min = minEnrol
    addedEvent.extendedProperties.private.max = maxEnrol
    addedEvent.extendedProperties.private.cost = cost
    dispatch('eventUpdate', { event: addedEvent })
  }

  const removeEvent = () => {
    addedEvent.id = id
    dispatch('eventRemove', { event: addedEvent })
  }

  let id = ''
  let summary = ''
  let description = ''
  let location = ''
  let startDateTime = ''
  let recurrence = []
  let contact = ''
  let presenter = ''
  let minEnrol = ''
  let maxEnrol = ''
  let cost = ''
  let minMaxCost = ''
  let valid = true

  $: recurRule = recurrence[0] ? rrule.RRule.fromString(recurrence[0]) : ''
  $: recurText = recurRule ? recurRule.toText() : ''
  $: recurDates = recurRule ? decodeRecurDates(recurRule, startDateTime) : ''

  const addedEvent = {
    id: null,
    description: '',
    location: '',
    summary: '',
    isAllDayEvent: false,
    startDateTime: '',
    endDateTime: '',
    recurrence: [],
    extendedProperties: {
      private: {
        presenter: '',
        contact: '',
        min: '',
        max: '',
        cost: ''
      }
    }
  }
</script>

<style>
  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0rem;
  }
  .col-1 {
    grid-column-start: 1;
  }
  .col-2 {
    grid-column-start: 2;
  }
  .inline {
    display: inline-block;
    width: 30%;
  }
</style>

<div class="grid-2 mt-3">

  <div class="input-container col-1">
    <input type="text" bind:value={summary} />
    <label>Summary</label>
  </div>

  <div class="input-container col-2">
    <input type="text" bind:value={location} />
    <label>Location</label>
  </div>

  <div class="input-container col-1">
    <input type="date" bind:value={startDateTime} />
    <label>Start Date</label>
  </div>

  <div class="input-container col-2">
    <input type="text" bind:value={presenter} />
    <label>Presenter</label>
  </div>

  <div class="input-container col-1">
    <textarea bind:value={description} rows="4" />
    <label>Description</label>
  </div>

  <div class="input-container col-2">
    <input type="text" bind:value={contact} />
    <label>Contact</label>
  </div>
</div>

<div class="inline input-container col-1">
  <input class="inline" type="text" bind:value={minEnrol} />
  <label>Min/Max/Cost</label>
  <input class="inline" type="text" bind:value={maxEnrol} />
  <input class="inline" type="text" bind:value={cost} />
</div>

<br />
<div class="buttons">
  {#if formType === 'create'}
    <button on:click={addNewEvent} disabled={!valid}>Add New Event</button>
  {:else if formType === 'update'}
    <button on:click={updateEvent} disabled={!valid}>Update Event</button>
  {:else if formType === 'remove'}
    <button on:click={removeEvent} disabled={!valid}>Delete Event</button>
  {:else}
    <p>Nothing to do</p>
  {/if}

</div>

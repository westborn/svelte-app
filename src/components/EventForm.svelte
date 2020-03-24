<script>
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { ymd } from '../utils'

  const dispatch = createEventDispatcher()

  export let event = {}
  export let formType = ''

  onMount(() => {
    //setup data entry for add/update/remove
    if (formType === 'update') {
      console.log(event)
      summary = event.summary
      description = event.description
      location = event.location
      startDate = event.startDateTime === '' ? '' : ymd(new Date(event.startDateTime))
      presenter = event.extendedProperties.private.presenter
      contact = event.extendedProperties.private.contact
      minEnrol = event.extendedProperties.private.min
      maxEnrol = event.extendedProperties.private.max
      cost = event.extendedProperties.private.cost
    }
  })

  const decodeRecurDates = (eventRule, dte) => {
    const newRule = new rrule.RRule({
      ...eventRule.origOptions,
      dtstart: new Date(dte)
    })
    const futureDates = newRule.all((date, i) => i < 6).map(dte => dmy(dte))
    return `${futureDates.join(', ')}${futureDates.length > 5 ? '...' : ''}`
  }

  const addNewEvent = () => {
    resultEvent.summary = summary
    resultEvent.description = description
    resultEvent.location = location
    resultEvent.isAllDayEvent = true
    resultEvent.startDateTime = startDate
    resultEvent.endDateTime = startDate
    resultEvent.recurrence = recurrence
    resultEvent.extendedProperties.private.presenter = presenter
    resultEvent.extendedProperties.private.contact = contact
    resultEvent.extendedProperties.private.min = minEnrol
    resultEvent.extendedProperties.private.max = maxEnrol
    resultEvent.extendedProperties.private.cost = cost
    dispatch('eventCreate', { event: resultEvent })
  }

  const updateEvent = () => {
    resultEvent.summary = summary
    resultEvent.description = description
    resultEvent.location = location
    resultEvent.isAllDayEvent = true
    resultEvent.startDateTime = startDate
    resultEvent.endDateTime = startDate
    resultEvent.recurrence = recurrence
    resultEvent.extendedProperties.private.presenter = presenter
    resultEvent.extendedProperties.private.contact = contact
    resultEvent.extendedProperties.private.min = minEnrol
    resultEvent.extendedProperties.private.max = maxEnrol
    resultEvent.extendedProperties.private.cost = cost
    dispatch('eventUpdate', { event: resultEvent })
  }

  const removeEvent = () => {
    resultEvent.id = id
    dispatch('eventRemove', { event: resultEvent })
  }

  let id = ''
  let summary = ''
  let description = ''
  let location = ''
  let startDate = ''
  let recurrence = []
  let contact = ''
  let presenter = ''
  let minEnrol = ''
  let maxEnrol = ''
  let cost = ''
  let minMaxCost = ''
  let valid = true //TODO

  $: recurRule = recurrence[0] ? rrule.RRule.fromString(recurrence[0]) : ''
  $: recurText = recurRule ? recurRule.toText() : ''
  $: recurDates = recurRule ? decodeRecurDates(recurRule, startDate) : ''

  let resultEvent = {
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
    width: 80%;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 1rem;
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

{#if formType === 'remove'}
  <br />
  <h3>
    About to delete this event -
    <span class="bg-danger">{event.summary}</span>
  </h3>
{:else}
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
      <input type="date" bind:value={startDate} />
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
{/if}
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

  <button
    on:click={() => {
      console.log('Cancelled')
      dispatch('eventCancel')
    }}>
    Cancel
  </button>

</div>

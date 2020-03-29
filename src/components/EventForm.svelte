<script>
  import { onMount, tick } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { ymd, decodeRecurRule, decodeRecurText, decodeRecurDates } from '../utils'
  import RecurForm from './RecurForm.svelte'

  const dispatch = createEventDispatcher()

  export let formType = ''
  export let event
  export let presenters
  export let venues
  export let contacts

  const times = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00'
  ]

  onMount(() => {
    id = event.id

    //setup data entry for update
    if (formType === 'update') {
      selectedVenue = venues.findIndex(x => x.name === event.location)
      selectedPresenter = presenters.findIndex(
        x => x.name === event.extendedProperties.private.presenter || 0
      )
      selectedContact = contacts.findIndex(x => x.name === event.extendedProperties.private.contact)

      summary = event.summary
      description = event.description
      startDate = event.startDateTime === '' ? '' : ymd(new Date(event.startDateTime))
      recurrence = [...event.recurrence]
      minEnrol = event.extendedProperties.private.min
      maxEnrol = event.extendedProperties.private.max
      cost = event.extendedProperties.private.cost
    }
  })

  const addNewEvent = () => {
    resultEvent.summary = summary
    resultEvent.description = description
    resultEvent.location = venues[selectedVenue].name
    resultEvent.isAllDayEvent = true //TODO
    resultEvent.startDateTime = startDate //TODO
    resultEvent.endDateTime = startDate //TODO
    resultEvent.recurrence = recurrence //TODO
    resultEvent.extendedProperties.private.presenter = presenters[selectedPresenter].name
    resultEvent.extendedProperties.private.contact = contacts[selectedContact].name
    resultEvent.extendedProperties.private.min = minEnrol
    resultEvent.extendedProperties.private.max = maxEnrol
    resultEvent.extendedProperties.private.cost = cost
    dispatch('eventCreate', { event: resultEvent })
  }

  const updateEvent = () => {
    resultEvent = { ...event }
    resultEvent.summary = summary
    resultEvent.description = description
    resultEvent.location = venues[selectedVenue].name
    // resultEvent.isAllDayEvent = true //TODO
    // resultEvent.startDateTime = startDate //TODO
    // resultEvent.endDateTime = startDate //TODO
    // resultEvent.recurrence = recurrence //TODO
    resultEvent.extendedProperties.private.presenter = presenters[selectedPresenter].name
    resultEvent.extendedProperties.private.contact = contacts[selectedContact].name
    resultEvent.extendedProperties.private.min = minEnrol
    resultEvent.extendedProperties.private.max = maxEnrol
    resultEvent.extendedProperties.private.cost = cost
    console.log(resultEvent)
    dispatch('eventUpdate', { event: resultEvent })
  }

  const removeEvent = () => {
    resultEvent.id = id
    dispatch('eventRemove', { event: resultEvent })
  }

  let selectedPresenter = 0
  let selectedVenue = 0
  let selectedContact = 0

  let id = ''
  let summary = ''
  let description = ''
  let startDate = ''
  let selectedStartTime = ''
  let selectedEndTime = ''
  let recurrence = []
  let minEnrol = ''
  let maxEnrol = ''
  let cost = ''
  let minMaxCost = ''
  let valid = true //TODO

  const timestampUTC = (dte, tme) => {
    if (dte === '') return '2020-03-28T02:00:00.000Z'
    return '2020-02-28T02:00:00.000Z'
  }

  $: startDateTime = timestampUTC(startDate, selectedStartTime)

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

  const selectedModal = e => {
    console.log(e)
    showDayPicker = false
  }

  let showDayPicker = false
</script>

<style>
  .layout-2col {
    display: grid;
    width: 80%;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, auto);
    gap: 0.4rem;
  }
  .layout-3col {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 1rem;
  }

  .input-field-small {
    width: 50%;
  }
</style>

{#if formType === 'remove'}
  <br />
  <h3>
    About to delete this event -
    <span class="bg-danger">{event.summary}</span>
  </h3>
{:else}
  <div class="layout-2col">

    <div class="input-field col-1">
      <input type="text" bind:value={summary} />
      <label>Summary</label>
    </div>

    <div class="input-field col-2">
      <select bind:value={selectedPresenter}>
        {#each presenters as item (item.id)}
          <option value={item.id}>{item.name}</option>
        {/each}
      </select>
      <label>Presenter</label>
    </div>

    <div class="layout-3col input-field col-1">
      <input class="col-1" type="date" bind:value={startDate} />
      <label>Event Date / Start Time / End Time</label>
      <select class="col-2" bind:value={selectedStartTime}>
        {#each times as item (item)}
          <option value={item}>{item}</option>
        {/each}
      </select>
      <select class="col-3" bind:value={selectedEndTime}>
        {#each times as item (item)}
          <option value={item}>{item}</option>
        {/each}
      </select>
    </div>

    <div class="input-field col-2">
      <select bind:value={selectedContact}>
        {#each contacts as item (item.id)}
          <option value={item.id}>{item.name}</option>
        {/each}
      </select>
      <label>Contact</label>
    </div>

    <div class="input-field col-1">
      <select bind:value={selectedVenue}>
        {#each venues as item (item.id)}
          <option value={item.id}>{item.name}</option>
        {/each}
      </select>
      <label>Location</label>
    </div>

    <div class="layout-3col input-field input-field-small col-2">
      <input type="text" bind:value={minEnrol} />
      <label>Min/Max/Cost</label>
      <input type="text" bind:value={maxEnrol} />
      <input type="text" bind:value={cost} />
    </div>

    <div class="input-field col-1">
      <textarea bind:value={description} rows="4" />
      <label>Description</label>
    </div>

    <div class="col-2">
      <p>Recurs: {recurText}</p>
      <button on:click={() => (showDayPicker = true)}>Edit Recurrence Details</button>
    </div>

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

<!-- ===========================================  Modal for Recurring Editor -->
{#if showDayPicker}
  <RecurForm
    {recurrence}
    {startDateTime}
    on:cancel={() => (showDayPicker = false)}
    on:selected={e => selectedModal(e.detail.payload)} />
{/if}

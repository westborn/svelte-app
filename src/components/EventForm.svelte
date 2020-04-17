<script>
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import {
    TIMES,
    dmyToYMD,
    decodeRecurDates,
    encodeDateTime,
    decodeDateTime,
    validateRule
  } from '../utils'

  import RecurForm from './RecurForm.svelte'

  const dispatch = createEventDispatcher()

  export let formType = ''
  export let event
  export let presenters
  export let venues
  export let contacts

  onMount(() => {
    id = event.id
    console.log(`eventFormMount: ${JSON.stringify(event, null, 2)}`)

    if (formType === 'update') {
      // if these select boxers are not recognized default to 0
      selectedVenue = venues.findIndex(x => x.name === event.location || 0)
      selectedPresenter = presenters.findIndex(
        x => x.name === event.extendedProperties.private.presenter || 0
      )
      selectedContact = contacts.findIndex(
        x => x.name === event.extendedProperties.private.contact || 0
      )
      if (selectedVenue === -1) selectedVenue = 0
      if (selectedPresenter === -1) selectedPresenter = 0
      if (selectedContact === -1) selectedContact = 0

      summary = event.summary
      description = event.description

      let dateAndTime = {}
      // console.log('mount3:', event.startDateTime)
      dateAndTime = decodeDateTime(event.startDateTime)
      startYMD = dateAndTime.dte
      selectedStartTime = dateAndTime.tme

      // console.log('mount4:', event.endDateTime)
      dateAndTime = decodeDateTime(event.endDateTime)
      selectedEndTime = dateAndTime.tme
      // console.log('mount5:', selectedEndTime)
      ;[recurrence] = event.recurrence
      minEnrol = event.extendedProperties.private.min
      maxEnrol = event.extendedProperties.private.max
      cost = event.extendedProperties.private.cost
    }
    if (formType === 'create') {
      startYMD = dmyToYMD(new Date().toLocaleString().slice(0, 10))
      // console.log('create', startYMD)
    }
  })

  const selectedModal = recurOptions => {
    console.log(`exit Modal: ${JSON.stringify(recurOptions)}`)
    const { ruleText, ruleString } = validateRule(recurOptions)
    console.log('exit Modal Rule:', ruleString)
    recurrence = ruleString
    showRecurPicker = false
  }

  const validateEvent = () => {
    // startdate is a date
    // startime exists
    // endtime exists
    // startime <= endtime
  }

  const addNewEvent = () => {
    resultEvent.summary = summary
    resultEvent.description = description
    resultEvent.location = venues[selectedVenue].name
    resultEvent.startDateTime = encodeDateTime(startYMD, selectedStartTime) //TODO
    resultEvent.endDateTime = encodeDateTime(startYMD, selectedEndTime) //TODO
    resultEvent.recurrence = recurrence //TODO
    resultEvent.extendedProperties.private.presenter = presenters[selectedPresenter].name
    resultEvent.extendedProperties.private.contact = contacts[selectedContact].name
    resultEvent.extendedProperties.private.min = minEnrol ? minEnrol : 0
    resultEvent.extendedProperties.private.max = maxEnrol ? maxEnrol : 0
    resultEvent.extendedProperties.private.cost = cost ? cost : 0
    console.log(resultEvent)
    dispatch('eventCreate', { event: resultEvent })
  }

  const updateEvent = () => {
    resultEvent = { ...event }
    resultEvent.summary = summary
    resultEvent.description = description
    resultEvent.location = venues[selectedVenue].name
    resultEvent.startDateTime = encodeDateTime(startYMD, selectedStartTime) //TODO
    resultEvent.endDateTime = encodeDateTime(startYMD, selectedEndTime) //TODO
    resultEvent.recurrence = recurrence //TODO
    resultEvent.extendedProperties.private.presenter = presenters[selectedPresenter].name
    resultEvent.extendedProperties.private.contact = contacts[selectedContact].name
    resultEvent.extendedProperties.private.min = minEnrol ? minEnrol : 0
    resultEvent.extendedProperties.private.max = maxEnrol ? maxEnrol : 0
    resultEvent.extendedProperties.private.cost = cost ? cost : 0
    console.log(resultEvent)
    dispatch('eventUpdate', { event: resultEvent })
  }

  const removeEvent = () => {
    resultEvent.id = id
    dispatch('eventRemove', { event: resultEvent })
  }

  let showRecurPicker = false

  let selectedPresenter = 0
  let selectedVenue = 0
  let selectedContact = 0

  let id = ''
  let summary = ''
  let description = ''
  let startYMD = '2020-02-01'
  let selectedStartTime = '08:00'
  $: startDateTime = encodeDateTime(startYMD, selectedStartTime)
  let selectedEndTime = ''
  let recurrence = ''
  let minEnrol = ''
  let maxEnrol = ''
  let cost = ''
  let minMaxCost = ''
  let valid = true //TODO

  $: recurRule = recurrence ? rrule.RRule.fromString(recurrence) : ''
  $: recurText = recurRule ? recurRule.toText() : ''
  $: recurDates = recurRule ? decodeRecurDates(recurRule, startDateTime) : ''

  let resultEvent = {
    id: null,
    description: '',
    location: '',
    summary: '',
    startDateTime: '',
    endDateTime: '',
    recurrence: [],
    extendedProperties: {
      private: {
        presenter: '',
        contact: '',
        min: 0,
        max: 0,
        cost: 0
      }
    }
  }
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
      <input class="col-1" type="date" bind:value={startYMD} />
      <label>Event Date / Start Time / End Time</label>
      <select class="col-2" bind:value={selectedStartTime}>
        {#each TIMES as item (item)}
          <option value={item}>{item}</option>
        {/each}
      </select>
      <select class="col-3" bind:value={selectedEndTime}>
        {#each TIMES as item (item)}
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
      <p>On: {recurDates}</p>
      <button
        class="btn"
        on:click={() => {
          console.log(`Modal: startYMD: ${startYMD}`)
          showRecurPicker = true
        }}>
        Edit Recurrence Details
      </button>
    </div>

  </div>
{/if}
<br />
<div>
  {#if formType === 'create'}
    <button class="btn" on:click={addNewEvent} disabled={!valid}>Add New Event</button>
  {:else if formType === 'update'}
    <button class="btn" on:click={updateEvent} disabled={!valid}>Update Event</button>
  {:else if formType === 'remove'}
    <button class="btn" on:click={removeEvent} disabled={!valid}>Delete Event</button>
  {:else}
    <p>Nothing to do</p>
  {/if}

  <button
    class="btn"
    on:click={() => {
      console.log('Cancelled')
      dispatch('eventCancel')
    }}>
    Cancel
  </button>

</div>

<!-- ===========================================  Modal for Recurring Editor -->
{#if showRecurPicker}
  <RecurForm
    {recurrence}
    {startDateTime}
    on:cancel={() => (showRecurPicker = false)}
    on:selected={e => selectedModal(e.detail.payload)} />
{/if}

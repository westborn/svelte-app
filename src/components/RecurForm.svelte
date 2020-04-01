<script>
  import { createEventDispatcher, onDestroy } from 'svelte'
  import WeekDayPicker from './WeekDayPicker.svelte'
  import { ymd, decodeRecurRule, decodeRecurText, decodeRecurDates } from '../utils'

  export let recurrence
  export let startDateTime

  const dispatch = createEventDispatcher()
  const cancel = () => {
    dispatch('cancel')
  }

  const handle_keydown = e => {
    if (e.key === 'Escape') {
      close()
      return
    }

    if (e.key === 'Tab') {
      // trap focus
      const nodes = modal.querySelectorAll('*')
      const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0)

      let index = tabbable.indexOf(document.activeElement)
      if (index === -1 && e.shiftKey) index = 0

      index += tabbable.length + (e.shiftKey ? -1 : 1)
      index %= tabbable.length

      tabbable[index].focus()
      e.preventDefault()
    }
  }

  const previously_focused = typeof document !== 'undefined' && document.activeElement

  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus()
    })
  }

  const selected = () => {
    console.log(recurOptions)
    recurOptions.freq = enterFreq
    recurOptions.byweekday = Object.keys(daysSelected).filter(el => daysSelected[el] === true)
    recurOptions.count = enterCount
    recurOptions.interval = enterInterval
    recurOptions.until = enterUntil
    dispatch('selected', { payload: recurOptions })
  }

  const FREQUENCIES = ['YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY', 'HOURLY', 'MINUTELY', 'SECONDLY']
  const YEARLY = 0
  const MONTHLY = 1
  const WEEKLY = 2
  const DAILY = 3
  const HOURLY = 4
  const MINUTELY = 5
  const SECONDLY = 6

  const Days = {
    MO: 0,
    TU: 1,
    WE: 2,
    TH: 3,
    FR: 4,
    SA: 5,
    SU: 6
  }
  const ALL_WEEKDAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

  const recurOptions = {
    freq: null,
    dtstart: null,
    interval: null,
    wkst: null,
    count: null,
    until: null,
    byweekday: null,
    bymonth: null,
    bymonthday: null
  }

  const DEFAULT_OPTIONS = {
    freq: null,
    dtstart: null,
    interval: 1,
    wkst: 'MO',
    count: null,
    until: null,
    byweekday: null,
    bymonth: null,
    bymonthday: null
  }
  let modal
  let daysSelected = {
    MO: false,
    TU: false,
    WE: false,
    TH: false,
    FR: false,
    SA: false,
    SU: false
  }
  let enterFreq = 'DAILY'
  let enterCount = null
  let enterInterval = null
  let enterUntil = null
  let repeatEnds = 1

  $: recurRule = recurrence ? rrule.RRule.fromString(recurrence) : ''
  $: recurText = recurRule ? recurRule.toText() : ''
  $: recurDates = recurRule ? decodeRecurDates(recurRule, ymd(new Date(startDateTime))) : ''
</script>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw - 2em);
    max-width: 26em;
    max-height: calc(100vh - 2em);
    overflow: hidden;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 1em;
    background: var(--light-color);
  }
  button {
    display: block;
  }
  p {
    color: var(--light-gray);
    font-size: 1em;
  }

  .repeat-div {
    display: grid;
    grid-template-columns: 100px 50px 80px;
    gap: 0.5em;
    padding: 8px 0 5px 0;
  }

  .repeat-div select,
  input[type='number'] {
    border: 0;
    border-bottom: 1px solid #555;
    background: transparent;
    width: 100%;
    color: var(--dark-color);
  }

  /* http://code.iamkate.com/html-and-css/styling-checkboxes-and-radio-buttons/ */
  .ends-div {
    display: grid;
    grid-template-columns: 150px 500px;
    grid-template-rows: repeat(5, 40px);
  }
  .ends-div .lhs {
    grid-column-start: 1;
  }
  .ends-div .rhs3 {
    grid-column-start: 2;
    grid-row-start: 3;
  }
  .ends-div p {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .ends-div input[type='radio'] {
    width: 0em;
    opacity: 0;
  }
  .ends-div input[type='radio'] + label {
    display: inline-block;
    line-height: 1.2em;
  }
  .ends-div input[type='radio'] + label > span {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin: 0.25em 0.5em 0.25em 0.25em;
    border: 0.0625em solid rgb(192, 192, 192);
    border-radius: 0.25em;
    background: rgb(224, 224, 224);
    vertical-align: bottom;
  }
  .ends-div input[type='radio']:checked + label > span > span {
    display: block;
    width: 0.625em;
    height: 0.625em;
    margin: 0.125em;
    border: 0.0625em solid blue;
    border-radius: 0.125em;
    background: var(--primary-color);
  }
  .ends-div input[type='number'] {
    border: 0;
    border-bottom: 1px solid #555;
    background: transparent;
    width: 50px;
    color: var(--dark-color);
  }
</style>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" />

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>

  <div class="repeat-div">
    <p>Repeat Every</p>
    <input type="number" bind:value={enterInterval} min="1" max="15" />

    <select bind:value={enterFreq}>
      <option value="DAILY">days</option>
      <option value="WEEKLY">weeks</option>
      <option value="MONTHLY">months</option>
    </select>
  </div>

  <p class="my-1">Repeat On</p>
  <WeekDayPicker {daysSelected} />

  <div class="ends-div">
    <p class="lhs">Ends</p>
    <div class="lhs">
      <input id="one" type="radio" bind:group={repeatEnds} value={1} />
      <label for="one">
        <span>
          <span />
        </span>
        Never
      </label>
    </div>
    <div class="lhs">
      <input id="two" type="radio" bind:group={repeatEnds} value={2} />
      <label for="two">
        <span>
          <span />
        </span>
        On
      </label>
    </div>
    <div class="lhs">
      <input id="three" type="radio" bind:group={repeatEnds} value={3} />
      <label for="three">
        <span>
          <span />
        </span>
        After
      </label>
    </div>

    <div class="date-field rhs3">
      <input type="date" disabled={repeatEnds !== 2} bind:value={enterUntil} />
    </div>
    <div class="rhs4">
      <input type="number" disabled={repeatEnds !== 3} bind:value={enterInterval} />
      <span>Occurences</span>
    </div>

  </div>
  <br />
  <hr />
  <p>Recurs: {recurText}</p>
  <pre>{recurrence}</pre>
  <pre>{recurDates}</pre>
  <button on:click={selected}>Add/Change Recurrence</button>
  <button on:click={cancel}>Cancel</button>
</div>

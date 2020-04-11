<script>
  import { onMount, createEventDispatcher, onDestroy } from 'svelte'
  import WeekDayPicker from './WeekDayPicker.svelte'
  import { WEEKDAY_NAMES, decodeRecurDates, validateRule, parseRuleText } from '../utils'

  export let recurrence
  $: currentRecurRule = recurrence ? rrule.RRule.fromString(recurrence) : ''
  $: currentRecurText = currentRecurRule ? currentRecurRule.toText() : ''
  $: currentRecurDates = currentRecurRule ? decodeRecurDates(currentRecurRule, startDateTime) : ''

  export let startDateTime

  const dispatch = createEventDispatcher()
  const cancel = () => {
    dispatch('cancel')
  }

  onMount(() => {
    console.log(`mount1b: ${JSON.stringify(startDateTime, null, 2)}`)
    console.log(`mount1a: ${JSON.stringify(recurrence, null, 2)}`)
    recurOptions = !recurrence ? { ...DEFAULT_OPTIONS } : { ...parseRuleText(recurrence) }
    // delete recurOptions.wkst
    // console.log(`mount2: ${JSON.stringify(recurOptions, null, 2)}`)
    enterCount = null
    enterInterval = ''
    enterUntil = null
    repeatEnds = 1

    if (recurOptions.freq === null) {
      repeatEnds = 1
      enterFreq = '0'
      enterCount = null
      enterInterval = ''
      enterUntil = null
      return
    }
    enterFreq = String(recurOptions.freq)

    if (recurOptions.interval) {
      enterInterval = recurOptions.interval
    }

    // decode byweekday (from RRule, change the structure to an array)
    if (recurOptions.byweekday) {
      const tmp = recurOptions.byweekday.map(el => el.weekday)
      recurOptions.byweekday = [...tmp]
      // now populate the data entry for days of the week
      recurOptions.byweekday.map(el => {
        daysSelected[WEEKDAY_NAMES[el]] = true
      })
    }

    if (recurOptions.until) {
      enterUntil = recurOptions.until.toISOString().slice(0, 10)
      repeatEnds = 2
    }

    if (recurOptions.count) {
      enterCount = recurOptions.count
      repeatEnds = 3
    }
    // console.log(`mount3: ${JSON.stringify(recurOptions, null, 2)}`)
  })

  const handleEndsChange = e => {
    if (repeatEnds != 2) enterUntil = null
    if (repeatEnds != 3) enterCount = null
  }

  const validate = () => {
    valid = false
    // console.log(`B4 Valid freq: ${JSON.stringify(enterFreq, null, 2)}`)
    if (enterFreq === '0') {
      msg = 'Event Does Not Recur'
      valid = true
      return {}
    }
    recurOptions.freq = Number(enterFreq)

    recurOptions.interval = enterInterval

    console.log(`B4 Valid byweekday: ${JSON.stringify(recurOptions.byweekday, null, 2)}`)
    recurOptions.byweekday = Object.keys(daysSelected)
      .filter(el => daysSelected[el] === true)
      .map(el => WEEKDAY_NAMES.indexOf(el))
    console.log(`AFT Valid byweekday: ${JSON.stringify(recurOptions.byweekday, null, 2)}`)
    // if (!recurOptions.byweekday || !recurOptions.byweekday.length) {
    //   msg = 'Event MUST recur on at least one day'
    //   return {}
    // }

    if (repeatEnds === 1) {
      enterCount = null
      enterUntil = null
    }
    if (repeatEnds != 2) enterUntil = null
    if (repeatEnds != 3) enterCount = null

    recurOptions.count = enterCount

    recurOptions.until = enterUntil === null ? null : new Date(enterUntil)
    // remove keys that are null or have empty arrays
    const selectedOptions = { ...recurOptions }
    // Object.keys(recurOptions).map(el => {
    //   if (
    //     (recurOptions[el] instanceof Array && recurOptions[el].length === 0) ||
    //     recurOptions[el] === null
    //   ) {
    //     delete selectedOptions[el]
    //   }
    // })
    // console.log(`Aft Valid freq: ${JSON.stringify(enterFreq, null, 2)}`)
    // console.log(`valid in: ${JSON.stringify(selectedOptions, null, 2)}`)
    const { ruleText, ruleString } = validateRule(selectedOptions)
    // console.log(`valid out ruleText: ${JSON.stringify(ruleText, null, 2)}`)
    // console.log(`valid out ruleString: ${JSON.stringify(ruleString, null, 2)}`)

    newRecurrence = ruleString
    valid = true
    return selectedOptions
  }

  const selected = () => {
    const selectedOptions = validate()
    if (valid) {
      dispatch('selected', { payload: selectedOptions })
    }
  }

  let recurOptions = {
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
    interval: null,
    wkst: null,
    count: null,
    until: null,
    byweekday: null,
    bymonth: null,
    bymonthday: null
  }
  let daysSelected = {
    MO: false,
    TU: false,
    WE: false,
    TH: false,
    FR: false,
    SA: false,
    SU: false
  }

  let valid = true
  let msg = ''

  let enterFreq
  let enterCount
  let enterInterval
  let enterUntil
  let repeatEnds

  let newRecurrence

  $: newRecurRule = newRecurrence ? rrule.RRule.fromString(newRecurrence) : ''
  $: newRecurText = newRecurRule ? newRecurRule.toText() : ''
  $: newRecurDates = newRecurRule ? decodeRecurDates(newRecurRule, startDateTime) : ''
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
    max-width: 30em;
    max-height: calc(100vh - 2em);
    overflow: hidden;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 1em;
    background: var(--light-color);
  }

  p {
    color: var(--light-gray);
    font-size: 1em;
  }

  .repeat-div {
    display: grid;
    grid-template-columns: 100px 50px 100px;
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

<div class="modal-background" />

<div class="modal" role="dialog" aria-modal="true">

  <div class="repeat-div">
    <p>Repeat Every</p>
    <input type="number" bind:value={enterInterval} min="1" max="15" />

    <select bind:value={enterFreq}>
      <option value="0">NO Recur</option>
      <option value="3">days</option>
      <option value="2">weeks</option>
      <option value="1">months</option>
    </select>
  </div>

  <p class="my-1">Repeat On</p>
  <WeekDayPicker {daysSelected} />

  <div class="ends-div">
    <p class="lhs">Ends</p>
    <div class="lhs">
      <input
        id="one"
        type="radio"
        bind:group={repeatEnds}
        on:change={e => handleEndsChange(e)}
        value={1} />
      <label for="one">
        <span>
          <span />
        </span>
        Never
      </label>
    </div>
    <div class="lhs">
      <input
        id="two"
        type="radio"
        bind:group={repeatEnds}
        on:change={e => handleEndsChange(e)}
        value={2} />
      <label for="two">
        <span>
          <span />
        </span>
        On
      </label>
    </div>
    <div class="lhs">
      <input
        id="three"
        type="radio"
        bind:group={repeatEnds}
        on:change={e => handleEndsChange(e)}
        value={3} />
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
      <input type="number" disabled={repeatEnds !== 3} bind:value={enterCount} />
      <span>Occurences</span>
    </div>

  </div>
  <br />
  <hr />
  <p>Currently Recurs: {currentRecurText}</p>
  <p>Updated Recurence: {newRecurText}</p>
  <pre>{recurrence}</pre>
  <pre>{currentRecurDates}</pre>
  {#if !valid}
    <pre>{msg}</pre>
  {:else}
    <pre>{newRecurrence}</pre>
    <pre>{newRecurDates}</pre>
  {/if}
  <button class="btn" on:click={() => validate()}>Apply Recurrence</button>
  <button class="btn" on:click={() => selected()}>Add/Change Recurrence</button>
  <button class="btn" on:click={cancel}>Cancel</button>
</div>

<script>
  import Terms from './components/Terms.svelte'
  import RenderList from './components/RenderList.svelte'
  import { EVENTS, TERMS } from './DATA.js'

  const LOCAL = true

  const doIninitialise = () => {
    if (LOCAL) {
      showDates(TERMS)
      showEvents(EVENTS)
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
    console.log(sheetEvents)
    events = JSON.parse(sheetEvents)
    initialised = true
  }

  // Reactive for term fields
  let terms = []
  let termIndex = 0

  let events = []

  let people = [
    { first: 'Hans', last: 'Emil' },
    { first: 'Max', last: 'Mustermann' },
    { first: 'Roman', last: 'Tisch' }
  ]

  let initialised = false
  let filterValue = ''

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

  $: reset_inputs(selected)

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

  function reset_inputs(person) {
    first = person ? person.first : ''
    last = person ? person.last : ''
  }
</script>

<style>
  .app-select {
    width: 75%;
  }
</style>

<div class="container">

  {#if initialised}
    <Terms
      on:message={e => {
        termIndex = e.detail.termIndex
      }}
      {terms} />

    <input placeholder="Course filter" bind:value={filterValue} />
    <div class="app-select">
      <select bind:value={i} size={10}>
        <RenderList {events} />
      </select>
    </div>

    <label>
      <input bind:value={first} placeholder="first" />
    </label>
    <label>
      <input bind:value={last} placeholder="last" />
    </label>

    <div class="buttons">
      <button on:click={create} disabled={!first || !last}>create</button>
      <button on:click={update} disabled={!first || !last || !selected}>update</button>
      <button on:click={remove} disabled={!selected}>delete</button>
    </div>

    <pre>{JSON.stringify(terms[termIndex], null, 2)}</pre>
    <pre>{JSON.stringify(events, null, 2)}</pre>
  {:else}
    <button on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
</div>

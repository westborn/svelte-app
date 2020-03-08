<script>
  import Terms from './components/Terms.svelte'
  import { EVENTS, TERMS } from './DATA.js'

  console.log(EVENTS)
  console.log(TERMS)

  const LOCAL = true

  const doIninitialise = () => {
    if (LOCAL) {
      showDates(TERMS)
      showEvents(EVENTS)
      return
    } else {
      google.script.run.withSuccessHandler(showDates).codeGetDates()
      google.script.run.withSuccessHandler(showEvents).codeGetEvents()
    }
  }
  const showDates = sheetTerms => {
    initialised = true
    terms = JSON.parse(sheetTerms)
  }
  const showEvents = sheetEvents => {
    events = JSON.parse(sheetEvents)
    console.log(events)
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
  let i = 0

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
  * {
    font-family: inherit;
    font-size: inherit;
  }

  input {
    display: block;
    margin: 0 0 0.5em 0;
  }

  select {
    float: left;
    margin: 0 1em 1em 0;
    width: 14em;
  }

  .buttons {
    clear: both;
  }
</style>

<div class="container">
  {#if initialised}
    <Terms
      on:MESSAGE={e => {
        termIndex = e.detail.termIndex
      }}
      {terms} />

    <input placeholder="Name filter" bind:value={filterValue} />

    <select bind:value={i} size={5}>
      {#each filteredPeople as person, i}
        <option value={i}>{person.last}, {person.first}</option>
      {/each}
    </select>

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

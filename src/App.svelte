<script>
  import { onMount } from 'svelte'

  const LOCAL = true
  const TERMS =
    '[{"term":1,"startDate":"2020-02-05T13:00:00.000Z","endDate":"2020-04-27T14:00:00.000Z"},{"term":2,"startDate":"2020-04-29T14:00:00.000Z","endDate":"2020-07-20T14:00:00.000Z"},{"term":3,"startDate":"2020-07-22T14:00:00.000Z","endDate":"2020-10-12T13:00:00.000Z"},{"term":4,"startDate":"2020-10-14T13:00:00.000Z","endDate":"2020-11-29T13:00:00.000Z"}]'

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  const ymd = (t = new Date()) => t.toISOString().slice(0, 10)
  const splitDate = (t = new Date()) => t.toISOString().split(/[^\d]/)
  const fmtDateShort = dtStr => {
    // return dd-mmm
    const [y, m, d] = splitDate(new Date(dtStr))
    return d + '-' + monthNames[m - 1]
  }

  let initialised = false

  async function stall(stallTime = 3000) {
    await new Promise(resolve => setTimeout(resolve, stallTime))
  }

  onMount(async () => {
    await stall()
  })

  const doIninitialise = () => {
    if (LOCAL) {
      showDates(TERMS)
      return
    } else {
      google.script.run.withSuccessHandler(showDates).codeGetDates()
    }
  }

  const showDates = sheetTerms => {
    initialised = true
    terms = JSON.parse(sheetTerms)
  }

  let terms = []

  let people = [
    { first: 'Hans', last: 'Emil' },
    { first: 'Max', last: 'Mustermann' },
    { first: 'Roman', last: 'Tisch' }
  ]

  let startDate = ''
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
    <ul>
      {#each terms as term}
        <li>
          {`Term ${term.term} from ${fmtDateShort(term.startDate)} to ${fmtDateShort(term.endDate)}`}
        </li>
      {/each}
    </ul>

    <pre>{JSON.stringify(terms, null, 2)}</pre>
  {:else}
    <label>
      <input bind:value={startDate} placeholder="Date" />
    </label>
    <button on:click={doIninitialise} disabled={initialised}>Go</button>
  {/if}
</div>

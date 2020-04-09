<script>
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { fmtDate } from '../utils.js'

  const dispatch = createEventDispatcher()

  export let terms
  export let disabled

  let termNumber = 1
  let termStartDate = ''
  let termEndDate = ''
  // Reactive for term fields
  $: termDates = fmtDate(termStartDate) + ' - ' + fmtDate(termEndDate)

  onMount(() => {
    //compute the term we're currently in
    const today = new Date()
    const currentTerm = terms.reduce(function(acc, cur, j) {
      return new Date(cur.startDate) > today ? acc : cur
    }, terms[0])
    setTermDates(currentTerm)
  })

  const setTermDates = term => {
    termNumber = term.termNumber
    termStartDate = term.startDate
    termEndDate = term.endDate
  }
  const changeTerm = () => {
    termNumber += 1
    if (termNumber > 4) termNumber = 1
    setTermDates(terms[termNumber - 1])
    dispatch('message', { termIndex: termNumber - 1 })
  }
</script>

<style>
  .badge {
    font-size: 1rem;
    cursor: pointer;
  }
  button:disabled {
    cursor: not-allowed;
  }
  .badge:focus {
    outline: none;
  }
</style>

<p class="lead">
  Displaying Courses for Term
  <button {disabled} class="badge" on:click={changeTerm}>{termNumber}</button>
  {termDates}
</p>

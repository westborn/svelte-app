<script>
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let terms
  let termNumber = 1
  let termStartDate = ''
  let termEndDate = ''
  // Reactive for term fields
  $: termDates = fmtDateShort(termStartDate) + ' - ' + fmtDateShort(termEndDate)

  onMount(() => {
    //compute the term we're currently in
    const today = new Date()
    const currentTerm = terms.reduce(function(acc, cur, j) {
      return new Date(cur.startDate) > today ? acc : cur
    }, terms[0])
    setTermDates(currentTerm)
  })

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
    if (typeof dtStr === 'undefined' || dtStr === '') return 'unknown'
    const [y, m, d] = splitDate(new Date(dtStr))
    return d + '-' + monthNames[m - 1]
  }

  const setTermDates = term => {
    termNumber = term.termNumber
    termStartDate = term.startDate
    termEndDate = term.endDate
  }
  const changeTerm = () => {
    termNumber += 1
    if (termNumber > 4) termNumber = 1
    setTermDates(terms[termNumber - 1])
    dispatch('MESSAGE', { termIndex: termNumber - 1 })
  }
</script>

<h2>
  Displaying Courses for Term
  <button on:click={changeTerm}>{termNumber}</button>
  {termDates}
</h2>

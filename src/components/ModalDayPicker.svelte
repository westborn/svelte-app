<script>
  import { createEventDispatcher, onDestroy } from 'svelte'
  import WeekDayPicker from './WeekDayPicker.svelte'

  const dispatch = createEventDispatcher()
  const cancel = () => {
    dispatch('cancel')
  }
  const selected = () => {
    // console.log(daySelected)
    dispatch('selected', { payload: daySelected })
  }
  let modal
  let daySelected = {
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false
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
</script>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: 32em;
    max-height: calc(100vh - 4em);
    overflow: auto;
    transform: translate(-50%, -50%);
    padding: 1em;
    border-radius: 0.2em;
    background: var(--light-color);
  }

  button {
    display: block;
  }
</style>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" />

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
  <WeekDayPicker {daySelected} />
  <button on:click={selected}>Add/Change Recurrence</button>
  <button on:click={cancel}>Cancel</button>
</div>

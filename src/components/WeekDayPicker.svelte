<script>
  export let daySelected
</script>

<style>
  .weekDays-selector input {
    display: none !important;
  }

  .weekDays-selector input[type='checkbox'] + label {
    display: inline-block;
    border-radius: 50%;
    background: var(--light-gray);
    height: 25px;
    width: 25px;
    margin-right: 5px;
    line-height: 25px;
    text-align: center;
    cursor: pointer;
  }

  .weekDays-selector input[type='checkbox']:checked + label {
    background: var(--primary-color);
    color: #ffffff;
  }

  label {
    user-select: none;
  }
</style>

<div class="weekDays-selector">
  <input type="checkbox" bind:checked={daySelected.sun} id="sun" />
  <label for="sun">S</label>
  <input type="checkbox" bind:checked={daySelected.mon} id="mon" />
  <label for="mon">M</label>
  <input type="checkbox" bind:checked={daySelected.tue} id="tue" />
  <label for="tue">T</label>
  <input type="checkbox" bind:checked={daySelected.wed} id="wed" />
  <label for="wed">W</label>
  <input type="checkbox" bind:checked={daySelected.thu} id="thu" />
  <label for="thu">T</label>
  <input type="checkbox" bind:checked={daySelected.fri} id="fri" />
  <label for="fri">F</label>
  <input type="checkbox" bind:checked={daySelected.sat} id="sat" />
  <label for="sat">S</label>
</div>

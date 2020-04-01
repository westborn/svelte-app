<script>
  export let daysSelected
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
  <input type="checkbox" bind:checked={daysSelected.SU} id="SU" />
  <label for="SU">S</label>
  <input type="checkbox" bind:checked={daysSelected.MO} id="MO" />
  <label for="MO">M</label>
  <input type="checkbox" bind:checked={daysSelected.TU} id="TU" />
  <label for="TU">T</label>
  <input type="checkbox" bind:checked={daysSelected.WE} id="WE" />
  <label for="WE">W</label>
  <input type="checkbox" bind:checked={daysSelected.TH} id="TH" />
  <label for="TH">T</label>
  <input type="checkbox" bind:checked={daysSelected.FR} id="FR" />
  <label for="FR">F</label>
  <input type="checkbox" bind:checked={daysSelected.SA} id="SA" />
  <label for="SA">S</label>
</div>

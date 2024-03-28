import React from 'react'

function Skill(props: {
  classes?: string
  checked?: boolean
  onChange: (arg0: string, arg1: string | boolean) => void
  name: string
  value: string | number | readonly string[] | undefined
  label?: React.ReactNode
  hint?: React.ReactNode
  expertise?: boolean
}) {
  let classes = 'd-and-d-skill'
  if (props.classes) {
    classes += ' ' + props.classes
  }

  let checkedClass = 'd-and-d-skill-circle'
  if (props.checked) {
    if (props.expertise) {
      checkedClass += ' expert'
    } else {
      checkedClass += ' active'
    }
  }

  function skillToggle() {
    if (!props.checked) {
      props.onChange(props.name + 'Checked', true)
    } else if (!props.expertise) {
      props.onChange(props.name + 'Expert', true)
    } else {
      props.onChange(props.name + 'Checked', false)
      props.onChange(props.name + 'Expert', false)
    }
  }

  return (
    <div className={classes}>
      <div className={checkedClass} onClick={() => skillToggle()} />
      <input
        type='text'
        value={props.value ? props.value : ''}
        onChange={(e) => props.onChange(props.name, e.target.value)}
      />
      <label>{props.label}</label>
      {props.hint ? (
        <span className='d-and-d-skill-hint'>{props.hint}</span>
      ) : null}
    </div>
  )
}

export default Skill

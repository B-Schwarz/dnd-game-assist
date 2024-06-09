import React, {useEffect} from 'react'

function Skill(props: {
  classes?: string
  checked?: string
  onChange: (arg0: string, arg1: string | boolean) => void
  name: string
  value: string | number | readonly string[] | undefined
  label?: React.ReactNode
  hint?: React.ReactNode
}) {
  let classes = 'd-and-d-skill'
  if (props.classes) {
    classes += ' ' + props.classes
  }

  const [checked, setChecked] = React.useState<string>('d-and-d-skill-circle')

  let checkedClass = 'd-and-d-skill-circle'


  useEffect(() => {
    if (props.checked === 'normal') {
      setChecked(checkedClass + ' active')
    }

    if (props.checked === 'expert') {
      setChecked(checkedClass + ' expert')
    }

  }, [])

  function skillToggle() {
    switch (props.checked) {
      case 'normal':
        props.onChange(props.name + 'Checked', 'expert')
        setChecked(checkedClass + ' expert')
        break
      case 'expert':
        props.onChange(props.name + 'Checked', 'none')
        setChecked(checkedClass)
        break
      default:
        props.onChange(props.name + 'Checked', 'normal')
        setChecked(checkedClass + ' active')
        break
    }
  }

  return (<div className={classes}>
    <div className={checked} onClick={() => skillToggle()}/>
    <input
      type='text'
      value={props.value ? props.value : ''}
      onChange={(e) => props.onChange(props.name, e.target.value)}
    />
    <label>{props.label}</label>
    {props.hint ? (<span className='d-and-d-skill-hint'>{props.hint}</span>) : null}
  </div>)
}

export default Skill

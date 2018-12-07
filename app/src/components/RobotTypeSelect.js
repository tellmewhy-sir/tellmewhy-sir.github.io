import React from 'react'
import TYPES from '../enum/robotTypes'

const RobotTypeSelect = (props) => {
  const options = Object.keys(TYPES).map(key =>
    <option key={key} value={key}>{TYPES[key]}</option>  
  )

  return (
    <div className="select is-rounded">
      <select onChange={props.handleChange} value={props.value}>
        {options}
      </select>
    </div>
  )
}

export default RobotTypeSelect
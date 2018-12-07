import React from 'react'
import RobotTypeSelect from './RobotTypeSelect'

const CreateBotForm = (props) => {
  return (
    <div className="create-bot-form">
      <div className="field is-grouped">
        <div className="control">
          <label className="label" htmlFor="robotName">Robot name</label>
          <input 
            type="text" 
            className="input is-rounded"
            placeholder="required"
            value={props.robotName}
            onChange={props.handleInputChange}
            name="robotName" />
          {
            props.showRequired &&
            <div className="control">
              <div className="tag is-danger">A name for the robot is required.</div>
            </div>
          }
        </div>
        <div className="control">
          <label className="label" htmlFor="robotType">Robot type</label>
          <RobotTypeSelect
            value={props.robotType}
            handleChange={props.handleSelectChange} />
        </div>
        <div className="control">
          <label className="label" htmlFor="robotAmnt">Number of robots</label>
          <input 
            type="number"
            className="input is-rounded"
            value={props.robotAmnt}
            onChange={props.handleInputChange}
            name="robotAmnt" />
        </div>
        <div className="control">
          <button 
            className="button is-rounded"
            onClick={props.handleClick}>Create Bot</button>
        </div>
      </div>
    </div>
  )
}

export default CreateBotForm
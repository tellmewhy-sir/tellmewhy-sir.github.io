import React from 'react'

const AddRobotTask = (props) => (
  <div className="field is-grouped">
    <div className="control">
      <input 
        type="text"
        name="taskAction"
        className="input"
        onChange={props.handleInputChange} />
    </div>
    <div className="control">
      <input 
        type="number"
        name="taskTime"
        className="input"
        onChange={props.handleInputChange} />
    </div>
    <div className="control">
    <button 
      className="button"
      onClick={props.handleClick}>Add Task</button>
    </div>
  </div>
)

export default AddRobotTask
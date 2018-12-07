import React, { Component } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRobot } from '@fortawesome/free-solid-svg-icons'
import { ReactComponent as Robot } from '../robot.svg'

class Bot extends Component {
  state = {
    showLeaderBoard: false
  }

  showLeaderBoard = () => {
    this.setState({ showLeaderBoard: true })
  }

  hideLeaderBoard = () => {
    this.setState({ showLeaderBoard: false })
  }

  render() {
    const { data } = this.props
    const taskKeys = Object.keys(data.tasks)

    // filter out tasks set to null to avoid errors in 
    const notNullKeys = taskKeys.filter((key) => {
      return data.tasks[key]
    })
    
    const tasksList = notNullKeys.map(key => {
      const task = data.tasks[key]
      let bubbleText = task.description
      let bubbleClass = "task-bubble"
      let animationName = "bubble"
      if(task.types && !data.isValidTask(task)) {
        bubbleText = "DOES NOT COMPUTE!!"
        bubbleClass += " invalid"
        animationName = "invalid-bubble"
      }

      return (
        <CSSTransition
          key={key}
          classNames={animationName}
          timeout={2000}>
          <div className={bubbleClass}>
            {bubbleText}
          </div>
        </CSSTransition>)
    })

    let leaderboard = []
    
    if(this.props.leaderboard) {
      leaderboard = Object.keys(this.props.leaderboard).map(key => 
        <p key={key}>{`${key} : ${this.props.leaderboard[key]}`}</p>
      )
    }
        
    return (
      <div className="column is-one-third">
        <div className="contain-bot">
          {
            this.state.showLeaderBoard &&
            <div className="leaderboard">
              {leaderboard}
              <button 
                className="button"
                onClick={this.hideLeaderBoard}>
                Close
              </button>
            </div>
          }
          {
            !this.state.showLeaderBoard &&
            <div className="robot">
              <div className="robot__info">
                <Robot />
                <span className="robot__taskCount">{data.taskCount} task(s) remaining</span>
                <span className="robot__name">{data.name}</span>
                <div className="robot__type">{data.type}</div>
                <TransitionGroup>
                  {tasksList}
                </TransitionGroup>
              </div>
              <div className="robot__actions">
                {
                  (tasksList.length > 0) &&
                  <button 
                    className="button"
                    onClick={() => this.props.completeTasks(this.props.id)}>
                    Start
                  </button>
                }
                {
                  !tasksList.length && 
                  <button 
                    className="button"
                    onClick={() => this.props.assignTasks(this.props.id)}>
                    More tasks
                  </button>
                }
                <button 
                  className="button"
                  onClick={() => this.props.deleteRobot(this.props.id)}>
                  Deactivate
                </button>
                <button 
                  className="button"
                  onClick={this.showLeaderBoard}>
                  Leaderboard
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }
}

export default Bot;
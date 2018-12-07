import React, { Component } from 'react';
import RobotFactory from './robot'
import CreateBotForm from './components/CreateBotForm'
import Bot from './components/Bot'
import base from './base'
import './App.css';
import tasks from './enum/tasks'

const Factory = new RobotFactory()

const ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

class App extends Component {
  constructor() {
    super()

    this.state = {
      robotName: '',
      robotType: 'UNIPEDAL',
      robotAmnt: 1,
      showRequired: false,
      timers: {},
      bots:{},
      leaderboards: {}
    }
  }

  componentDidMount() {
    /** bind Firebase endpoints to respective endpoints in component state  */

    this.botsRef = base.bindToState('bots', {
      context: this,
      state: 'bots'
    })

    this.leadBoardRef = base.bindToState('leaderboards', {
      context: this,
      state: 'leaderboards'
    })
  }

  componentWillUnmount() {
    base.removeBinding(this.botsRef)
    base.removeBinding(this.leadBoardRef)
  }

  /** push bot data to bots endpoint in firebase */

  addBot = (botObj) => {
    const fbRef = base.push('bots', {
      data: botObj,
      then(err) {
        if(!err) {
          return false
        }
      }
    })
    const botKey = fbRef.key // get firebase key for bot data

    /** initialize empty slots for assigned task in leaderboard endpoint */
    
    const tasks = {}

    for(let key in botObj.tasks) {
      tasks[botObj.tasks[key].description] = 0
    }

    base.update(`leaderboards`, {
      data: {
        [botKey] : tasks
      },
      then(err) {
        if(!err) {
          return false
        }
      }
    })

    /** initilized empty slot for timer logging */

    const timers = {...this.state.timers}
    timers[botKey] = []

    this.setState({ timers })
  }

  deleteBot = (id) => {    
    base.remove(`bots/${id}`, (err) => {
      if(!err) {
        return false
      }
    })

    base.remove(`leaderboards/${id}`, (err) => {
      if(!err) {
        return false
      }
    })
  }

  updateBot = (id, data) => {
    base.update(`bots/${id}`, {
      data: data,
      then(err) {
        if(!err) {
          return false
        }
      }
    })
  }

  handleInputChange = (e) => {
    const name = e.target.name

    this.setState({
      [name] : e.target.value
    })
  }

  handleSelectChange = (e) => {
    this.setState({ robotType: e.target.value })
  }

  handleCreateFormSubmit = () => {
    // simple form validation
    if(!this.state.robotName) {
      this.setState({ showRequired : true })
      return false
    } else {
      this.setState({ showRequired : false })
    }

    if(this.state.robotAmnt > 1) {   // if user wants to make multiple robots
      const name = this.state.robotName
      for (let i = 0; i < this.state.robotAmnt; i++) {
        const iterName = `${name}${ID()}` // append string hash to name given for each robot
        this.createRobot(iterName, this.state.robotType)
      }
    } else { 
      const { robotName, robotType } = this.state
      this.createRobot(robotName, robotType)
    }

    /** reset form to default */
    this.setState({
      robotName: '',
      robotType: 'UNIPEDAL',
      robotAmnt: 1
    })
  }

  createRobot = (name, type) => {
    let robot;
  
    try { // createRobot throws error if given invalid data
      robot = Factory.createRobot({
        name: name, 
        type: type,
        id: `bot${ID()}`
      })
    } catch (error) {
      console.log(error)
    }

    if(robot) {
      try {
        robot.assignTasks(this.getTasks())
        this.addBot(robot)
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('Could not create robot');
    }
  }

  /** attempt to log timers for each bot so that they can be canceled when robot is deleted */

  logTimer = (botKey, timerId) => {
    const timersMap = {...this.state.timers}
    let currentBotTimers = [...timersMap[botKey]]
    currentBotTimers.push(timerId)
    timersMap[botKey] = currentBotTimers

    this.setState((prevState, props) => {
      return { timers: timersMap } 
    })
  }

  updateLeaderBoard = (botId, task) => {
    let update = 1
    
    if(this.state.leaderboards[botId][task.description]) {
      update = this.state.leaderboards[botId][task.description] + 1
    }

    base.update(`leaderboards/${botId}`, {
      data: {
        [task.description] : update
      },
      then(err) {
        if(!err) {}
      }
    })
  }

  handleAssignTasks = (id) => {
    const bots = {...this.state.bots}
    const selectedBot = bots[id]
    if(!selectedBot.tasks) {
      selectedBot.tasks = {}
    }
    const assignedBot = Factory.createRobot(selectedBot)
    assignedBot.assignTasks(this.getTasks())    
    this.updateBot(id, assignedBot)
  }

  /** choose 5 tasks from tasklist and return them in an array */

  getTasks = () => {
    const tasksClone = [...tasks]
    const assignments = []

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * tasksClone.length)
      assignments.push(tasksClone.splice(randomIndex, 1)[0])
    }

    return assignments
  }

  handleCompleteTasks = (botKey) => {
    const bots = {...this.state.bots}
    const currentBot = Factory.createRobot(bots[botKey])
    
    const taskIds = Object.keys(currentBot.tasks)
    const tasks = {...currentBot.tasks}

    for (let i = 0; i < taskIds.length; i++) {
      currentBot.initiateTask(taskIds[i], (err, timerCancel) => {  
        if(err) {
          // clearTimeout(timerCancel) // clear all timeouts for invalid tasks
          setTimeout(() => {        
            this.updateBot(botKey, currentBot)
          }, 0)
          console.log(`${currentBot.name} can't ${tasks[taskIds[i]].description}`)
          return false
        }
        
        // this.logTimer(botKey, timerCancel)

        this.updateLeaderBoard(botKey, tasks[taskIds[i]])
      })

      /** match timeout set inside Robot.initiateTask() */
      setTimeout(() => {        
        this.updateBot(botKey, currentBot)
      }, tasks[taskIds[i]].eta)
    }
  }

  render() {
    const bots = Object.keys(this.state.bots).map((key) => {
      const botData = this.state.bots[key]
      return (
        <Bot 
          key={key}
          id={key}
          data={Factory.createRobot(botData)}
          leaderboard={this.state.leaderboards[key]}
          deleteRobot={this.deleteBot}
          handleInputChange={this.handleInputChange}
          completeTasks={this.handleCompleteTasks}
          assignTasks={this.handleAssignTasks} />
      )
    })

    return (
      <div className="App">
        <div className="topbar">
          <CreateBotForm 
            robotType={this.state.robotType}
            robotName={this.state.robotName}
            robotAmnt={this.state.robotAmnt}
            showRequired={this.state.showRequired}
            handleClick={this.handleCreateFormSubmit}
            handleInputChange={this.handleInputChange}
            handleSelectChange={this.handleSelectChange} />
        </div>
        <div className="contain-bots">
          <div className="columns is-gapless is-multiline">
            {bots}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

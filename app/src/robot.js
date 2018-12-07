import TYPES from './enum/robotTypes'

/**
 *  Made factory for create Robot objects. Made it a class in case I want to add more functions
 */

class RobotFactory {
  constructor() {
    this.count = 1 // not used
  }

  createRobot({id, name, type, tasks}) {    
    if (typeof name !== 'string' || typeof type !== 'string') {
      throw new Error('Name must be string, type must be number')
    }

    if(!TYPES[type]) {
      throw new Error('Did not provide valid robot type')
    }
    
    const robot = new Robot({id, name, type, tasks})

    return robot
  }
}

class Robot {
  constructor({id, name, type, tasks}) {
    this.id = id
    this.name = name
    this.type = type
    this.taskCount = tasks ? Object.keys(tasks).length : 0
    this.tasks = tasks || {}
  }

  assignTasks(tasksArr) {
    if(!Array.isArray(tasksArr)) {
      throw new Error('assignTask expects to be passed an array')
    }

    for (let i = 0; i < tasksArr.length; i++) {
      const task = tasksArr[i];
      const key = `task-${this.taskCount}`
      if(!this.tasks) {
        this.tasks = {}
      }
      this.tasks[key] = task
      this.taskCount++
    }    

    return this.tasks
  }

  isValidTask(taskObj) {
    if(taskObj.types && Array.isArray(taskObj.types)) {
      return taskObj.types.indexOf(this.type) >= 0
    } 
    throw new Error('Invalid robot type object given')
  }

  initiateTask(taskId, cb) {    
    const task = {...this.tasks[taskId]}

    //check if given invalid tasks
    if(task.types && Array.isArray(task.types)) {
      console.log(this.type, task.types)
      const valid = task.types.indexOf(this.type) >= 0
  
      if(!valid) {
        this.tasks[taskId] = null
        this.taskCount--
        return cb(new Error('Invalid task for robot type'))
      }
    }

    const timerId = setTimeout(() => {
      this.tasks[taskId] = null
      this.taskCount--
    }, task.eta)
    
    //callback passed timer id for possible use
    cb(null, timerId)
  }
}

export default RobotFactory
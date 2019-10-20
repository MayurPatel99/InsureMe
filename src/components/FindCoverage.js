import React, { Component } from 'react'
import { UserSession, Person, lookupProfile } from 'blockstack'
import NavBar from './NavBar'
import {jsonCopy, remove, add, check} from '../assets/utils'
import { appConfig, PRESCRIPTIONS_FILENAME } from '../assets/constants'
import '../styles/Profile.css'
import aetna from './aetna.json'
import horizon from './horizon.json'

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

class FindCoverage extends Component {

  constructor(props) {

  	super(props);
  	this.state = {
      person:"",
      username:"",
      provider:"",
      plan:"",
      text:"",

      tasks: [],
      value: '',
    }

    this.loadTasks = this.loadTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addTask = this.addTask.bind(this);
    this.removeTask = this.removeTask.bind(this);
  }

  componentWillMount() {
    this.loadTasks();
    this.fetchData();
    const { userSession } = this.props;
    this.setState({
      person: new Person(userSession.loadUserData().profile),
      username: userSession.loadUserData().username,
    })
  }

  isLocal() {
    return this.props.match.params.username ? false : true
  }

  fetchData() {
    const { userSession } = this.props
    this.setState({ isLoading: true })
    if (this.isLocal()) {
      const options = { decrypt: false }
      userSession.getFile('provider.json', options)
        .then((file) => {
          var statuses = JSON.parse(file || '[]')
          this.setState({
            person: new Person(userSession.loadUserData().profile),
            username: userSession.loadUserData().username,
            provider: statuses
          })
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
        userSession.getFile('plan.json', options)
          .then((file) => {
            var statuses = JSON.parse(file || '[]')
            this.setState({
              person: new Person(userSession.loadUserData().profile),
              username: userSession.loadUserData().username,
              plan: statuses,
            })
          })
          .finally(() => {
            this.setState({ isLoading: false })
          })
    } else {
      const username = this.props.match.params.username

      lookupProfile(username)
        .then((profile) => {
          this.setState({
            person: new Person(profile),
            username: username
          })
        })
        .catch((error) => {
          console.log('could not resolve profile')
        })

      const options = { username: username, decrypt: false }
      userSession.getFile('statuses.json', options)
        .then((file) => {
          var statuses = JSON.parse(file || '[]')
          this.setState({
            provider: statuses,
            plan: statuses
          })
        })
        .catch((error) => {
          console.log('could not fetch statuses')
        })
        .finally(() => {
          this.setState({ isLoading: false })
        })
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextTasks = nextProps.tasks;
    if(nextTasks) {
      if (nextTasks.length !== this.state.tasks.length) {
        this.setState({ tasks: jsonCopy(nextTasks) });
      }
    }
  }

  loadTasks() {
    const options = { decrypt: true };
    this.props.userSession.getFile(PRESCRIPTIONS_FILENAME, options)
    .then((content) => {
      if(content) {
        const tasks = JSON.parse(content);
        this.setState({tasks});
      }
    })
  }

  saveTasks(tasks) {
    const options = { encrypt: true };
    this.props.userSession.putFile(PRESCRIPTIONS_FILENAME, JSON.stringify(tasks), options);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
   }

  removeTask(e) {
    e.preventDefault();
    //fixed: undefined data-index from input
    const tasks = remove(e.currentTarget.dataset.index, this.state);
    this.setState({ tasks });
    this.saveTasks(tasks);
  }

  addTask(e) {
    e.preventDefault();

    //const tasks = add(this.state);

    let prescriptions = this.state.tasks;


    let prescription = {
      text: this.state.value,
      coverage: this.checkCoverage(this.state.value)
    }

    prescriptions.unshift(prescription)

    this.setState({value: '', prescriptions});
    this.saveTasks(prescriptions);
  }

  checkCoverage(prescription){
    console.log(this.state.provider);
    console.log(this.state.provider === "Horizon");
    if (this.state.provider == "Aetna"){
      if (aetna.text.includes(prescription)){
        return "Yes"
      } else {
        return "No"
      }
    } else if (this.state.provider == "Horizon") {
      if (horizon.text.includes(prescription)){
        return "Yes"
      } else {
        return "No"
      }
    } else{
      return "Your Provider is not Supported"
    }

  }

  render() {
    const { person } = this.state;
    const username = this.props.userSession.loadUserData().username;
    const profile = this.props.userSession.loadUserData();
    //const person = new Person(profile);
    return (
      <div className="Dashboard">
      <NavBar username={username} user={person} signOut={this.props.handleSignOut}/>
        <div className="row justify-content-center"id="header">
          <h3 className="user-info">
            {person.name()}'s Prescription List
          </h3>
        </div>
        <br></br>
        <div className="row justify-content-center">
          <div
            id="addTask"
            className="frame"
            style={{borderColor: '#f8f9fa'}}
          >
            <form onSubmit={this.addTask} className="input-group">
              <input
                className="form-control"
                type="text"
                onChange={this.handleChange}
                value={this.state.value}
                required
                placeholder="What prescription do you want to check coverage for?"
                autoFocus={true}
              />
              <div className="input-group-append" id="add-task">
                <input type="submit" className="btn btn-primary" value="Add"/>
              </div>
            </form>
            </div>
          </div>
        <br></br>
        <div className="row justify-content-center">
          <div className="frame">
            {this.state.tasks.map((task, i) =>
              <ul key={i}>
                <div className="row">
                  <div className="col">
                    <span className="input-group-text">
                      <div className="task">
                        {task.text}
                      <div className="text-right">
                        {
                          "Is it covered: ".concat(task.coverage)
                        }
                      </div>
                      </div>
                      <div className="delete">
                        <button className="btn btn-primary" data-index={i} onClick={this.removeTask}>
                          <div className="X" data-index={i}>X</div>
                        </button>
                      </div>
                    </span>
                    </div>
                  </div>
              </ul>
            )}
          </div>
      </div>
    </div>
  );
  }


}

export default FindCoverage

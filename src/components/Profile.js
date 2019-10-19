import React, { Component } from 'react'
import { UserSession, Person } from 'blockstack'
import NavBar from './NavBar'
import {jsonCopy, remove, add, check} from '../assets/utils'
import { appConfig, TASKS_FILENAME } from '../assets/constants'
import '../styles/Profile.css'

class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
      person: {
        name() {
          return 'Anonymous';
        },
        avatarUrl() {
          //return avatarFallbackImage;
        },
      },
      username: "",
      newStatus: "",
      statuses: [],
      statusIndex: 0,
      isLoading: false
    }

  }

  componentWillMount() {
    const { userSession } = this.props
    this.setState({
      person: new Person(userSession.loadUserData().profile),
      username: userSession.loadUserData().username
    });
  }

  componentWillReceiveProps(nextProps) {
    const nextTasks = nextProps.tasks;
    if(nextTasks) {
      if (nextTasks.length !== this.state.tasks.length) {
        this.setState({ tasks: jsonCopy(nextTasks) });
      }
    }
  }

  handleNewStatusChange(event) {
    this.setState({newStatus: event.target.value})
  }

  handleNewStatusSubmit(event) {
    this.saveNewStatus(this.state.newStatus)
    this.setState({
      newStatus: ""
    })
  }

  saveNewStatus(statusText) {
    const { userSession } = this.props
    let statuses = this.state.statuses

    let status = {
      id: this.state.statusIndex++,
      text: statusText.trim(),
      created_at: Date.now()
    }

    statuses.unshift(status)
    const options = { encrypt: false }
    userSession.putFile('statuses.json', JSON.stringify(statuses), options)
      .then(() => {
        this.setState({
          statuses: statuses
        })
      })
  }

   render() {
    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    const { username } = this.state;

    return (
      !userSession.isSignInPending() && person ?
      <div className="container">
      <NavBar username={username} user={person} signOut={this.props.handleSignOut}/>
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12">
              <div className="avatar-section">
                <img
                  src={ person.avatarUrl() }// ? person.avatarUrl() : avatarFallbackImage }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">{ person.name() ? person.name()
                      : 'Nameless Person' }</span>
                    </h1>
                  <span>{username}</span>
                  <span>
                    &nbsp;|&nbsp;
                    <a onClick={ handleSignOut.bind(this) }>(Logout)</a>
                  </span>
                </div>
              </div>
            </div>

            <div className="new-status">
              <div className="col-md-12">
                <textarea className="input-status"
                  value={this.state.newStatus}
                  onChange={e => this.handleNewStatusChange(e)}
                  placeholder="Enter a status"
                />
              </div>
              <div className="col-md-12">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={e => this.handleNewStatusSubmit(e)}
                >
                  Submit
                </button>
              </div>
            </div>

          </div>
        </div>
      </div> : null
    );
  }

}

// Made this a default prop (instead of using this.userSession) so a dummy userSession
// can be passed in for testing purposes
Profile.defaultProps = {
  userSession: new UserSession(appConfig)
};

export default Profile

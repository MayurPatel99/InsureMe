import React, { Component } from 'react';
import NavBar from './NavBar'
import '../styles/Profile.css'
import {
  Person,
  lookupProfile
} from 'blockstack';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
  	  person: {
  	  	name() {
          return 'Anonymous';
        },
  	  	avatarUrl() {
  	  	  return avatarFallbackImage;
  	  	},
  	  },
      username: "",
      newProvider: "",
      newPlan: "",
      provider: "",
      plan: "",
      isLoading: false
  	};
  }

  componentDidMount() {
    this.fetchData()
  }

  componentWillMount() {
    const { userSession } = this.props;
    this.setState({
      person: new Person(userSession.loadUserData().profile),
      username: userSession.loadUserData().username
    });
  }

  handleNewProviderChange(event) {
    this.setState({newProvider: event.target.value})
  }

  handleNewProviderSubmit(event) {
    this.saveNewProvider(this.state.newProvider)
    this.setState({
      newProvider: ""
    })
  }

  handleNewPlanChange(event) {
    this.setState({newPlan: event.target.value})
  }

  handleNewPlanSubmit(event) {
    this.saveNewPlan(this.state.newPlan)
    this.setState({
      newPlan: ""
    })
  }

  saveNewProvider(statusText) {
    const { userSession } = this.props

    const options = { encrypt: false }
    userSession.putFile('provider.json', JSON.stringify(statusText), options)
      .then(() => {
        this.setState({
          provider: statusText
        })
      })
  }

  saveNewPlan(statusText) {
    const { userSession } = this.props

    const options = { encrypt: false }
    userSession.putFile('plan.json', JSON.stringify(statusText), options)
      .then(() => {
        this.setState({
          plan: statusText
        })
      })
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

  isLocal() {
    return this.props.match.params.username ? false : true
  }

  render() {

    const { handleSignOut, userSession } = this.props;
    const { person } = this.state;
    const { username } = this.state;

    return (
      !userSession.isSignInPending() && person ?
      <div className="container">
      <NavBar username={username} user={person} signOut={this.props.handleSignOut}/>
        <div className="row text-center">
          <div className="col-md col-md">
            <div className="col-md">
              <div className="avatar-section">
                <img
                  src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">{ person.name() ? person.name()
                      : 'Nameless Person' }</span>
                  </h1>
                  <span>{username}</span>
                  {this.isLocal() &&
                    <span>
                      &nbsp;|&nbsp;
                      <a onClick={ handleSignOut.bind(this) }>(Logout)</a>
                    </span>
                  }
                </div>
              </div>
            </div>
            <div className="col-md statuses">
            Provider name:
            {this.state.isLoading && <span> Loading...</span>}
            {" ".concat(this.state.provider)}
            </div>
            <div className="col-md statuses">
            Plan name:
            {this.state.isLoading && <span> Loading...</span>}
            {" ".concat(this.state.plan)}
            </div>
            {this.isLocal() &&
              <div className="new-status">
                <div className="col-md-12">
                  <textarea className="input-status"
                    value={this.state.newProvider}
                    onChange={e => this.handleNewProviderChange(e)}
                    placeholder="Enter the Provider name."
                  />
                </div>
                <div className="col-md-12 text-center">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleNewProviderSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            }
            {this.isLocal() &&
              <div className="new-status">
                <div className="col-md-12">
                  <textarea className="input-status"
                    value={this.state.newPlan}
                    onChange={e => this.handleNewPlanChange(e)}
                    placeholder="Enter the Plan name."
                  />
                </div>
                <div className="col-md-12 text-center">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleNewPlanSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div> : null
    );
  }
}

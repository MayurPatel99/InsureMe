import React, { Component } from 'react';
import '../styles/Signin.css'

class Signin extends Component {

  render() {
    const { handleSignIn } = this.props;

    return (
      <div className ="intro">
        <div className="panel-landing" id="section-1">
          <h1 className="landing-heading">InsureMe</h1>
          <p>A decentralized Prescription app built on <a href="https://blockstack.org" target="_blank"rel="noopener noreferrer">Blockstack</a></p>
          <button
            className="btn btn-primary btn-lg"
            id="signin-button"
            onClick={ handleSignIn.bind(this) }
          >
            Sign In with Blockstack
          </button>
        </div>
      </div>
    );
  }
}

export default Signin

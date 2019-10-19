import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../styles/NavBar.css'

class NavBar extends Component {

  render() {
    const username = this.props.username
    const user = this.props.user
    return (
      <nav className="navbar navbar-expand-md navbar-dark bg-blue fixed-top">
        <Link className="navbar-brand" to="/">InsureMe</Link>
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link className="nav-link" to='/'>{username}</Link>
          </li>
        </ul>
        <img src={user.avatarUrl() ? user.avatarUrl() : './avatar-placeholder.png'} class="avatar" width="25" height="25"alt=""/>
        <button
          className="btn btn-primary"
          onClick={this.props.signOut.bind(this)}
        >Sign out
        </button>

      </nav>
    )
  }
}
  function openCity(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active"; 
}

export default NavBar

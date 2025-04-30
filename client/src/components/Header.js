import React from 'react'
import {Link} from 'react-router';

const Header = () => {
  return (
    <div>
      <div className="brand-logo">
        <h1>Aspire Match</h1>
      </div>
      <div className="nav-menu">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
      </div>
      <div className="call-to-action">
        <button><Link to="/user" >Job Seeker</Link></button>
        <button><Link to="/recruiter" >Recruiter</Link></button>
      </div>
    </div>
  )
}

export default Header
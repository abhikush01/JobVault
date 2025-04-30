import React from 'react'
import { Link } from 'react-router'
const NotFound = () => {
  return (
    <div>
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>Sorry, we couldn't find the page you're looking for.</p>
      <Link to="/">Go back home</Link>
    </div>
  )
}

export default NotFound
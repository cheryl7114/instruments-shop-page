import React from "react";

export default class Navbar extends React.Component {
  render() {
    return (
      <nav className="navbar">
        <div className="logo">
          <a href="../components/DisplayAllProducts.js">
            <img src="/logo.png" alt="Logo" width="70" height="90"/>
          </a>
        </div>
        <ul className="nav-links">
          <li><a href="#">help</a></li>
          <li><a href="#">orders and returns</a></li>
        </ul>
      </nav>
    );
  }
}
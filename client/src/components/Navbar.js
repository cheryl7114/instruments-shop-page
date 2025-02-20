import React from "react";
import { CiUser } from "react-icons/ci";
import { CiShoppingCart } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";

export default class Navbar extends React.Component {
  render() {
    return (
      <nav className="navbar">
        <div className="most-left-side">
          <div className="logo">
            <a href="../components/DisplayAllProducts.js">
              <img src="/logo.png" alt="Logo" width="50" height="60" />
            </a>
          </div>
          <ul className="nav-links">
            <li><a href="#">Guitar</a></li>
            <li><a href="#">Piano</a></li>
            <li><a href="#">Drums</a></li>
            <li><a href="#">Violin</a></li>
            <li><a href="#">Shop All</a></li>
          </ul>
        </div>
        <div className="most-right-side">
          <div className="search-bar">
            <CiSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>

          <CiUser className="user-icon" />
          <CiShoppingCart className="cart-icon" />
        </div>
      </nav>
    )
  }
}
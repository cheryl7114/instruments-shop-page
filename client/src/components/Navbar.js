import React from "react";
import { Link } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { CiShoppingCart } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";

export default class Navbar extends React.Component {
  handleSearchChange = (e) => {
    this.props.handleSearchChange(e)
  }
  render() {
    const profilePhoto = localStorage.profilePhoto !== "null" ? localStorage.profilePhoto : null;

    return (
      <nav className="navbar">
        <div className="most-left-side">
          <div className="logo">
            <Link to="/DisplayAllProducts">
              <img src="/logo.png" alt="Logo" width="50" height="60" />
            </Link>
          </div>
          <ul className="nav-links">
            <li><Link to="#">Guitar</Link></li>
            <li><Link to="#">Piano</Link></li>
            <li><Link to="#">Drums</Link></li>
            <li><Link to="#">Violin</Link></li>
            <li><Link to="#">Saxophone</Link></li>
            <li><Link to="#">Trumpet</Link></li>
            <li><Link to="#">Shop All</Link></li>
          </ul>
        </div>
        <div className="most-right-side">
          <div className="search-bar">
            <CiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={this.props.searchQuery}
              onChange={this.handleSearchChange}
            />
          </div>
          <CiShoppingCart className="cart-icon" />

          {profilePhoto && localStorage.userId ? (
            <Link to={`/UserProfile/${localStorage.userId}`}>
              <img className="profile-photo" src={`data:image/png;base64,${profilePhoto}`} alt="Profile" />
            </Link>
          ) : (
            <Link to="/Login">
              <CiUser className="user-icon" />
            </Link>
          )}
        </div>
      </nav>
    )
  }
}
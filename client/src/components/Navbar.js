import React from "react"

export default class Navbar extends React.Component {
    render() {
        return (
            <div>
                <nav className="navbar">
                    <div className="logo">Instruments</div>
                    <ul className="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Shop</a></li>
                        <li><a href="#">About</a></li>
                    </ul>
                </nav>
            </div>
        )
    }
}
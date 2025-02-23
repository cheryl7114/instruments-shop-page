import React, { Component } from "react"
import { Redirect, Link } from "react-router-dom"
import axios from "axios"

import LinkInClass from "../components/LinkInClass"
import { SERVER_HOST } from "../config/global_constants"

export default class Login extends Component {
    constructor(props) {
        super(props)

        this.state = {
            email: "",
            password: "",
            isLoggedIn: false
        }
    }


    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }


    handleSubmit = () => {
        axios.post(`${SERVER_HOST}/users/login/${this.state.email}/${this.state.password}`)
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else // user successfully logged in
                    {
                        console.log("User logged in")

                        localStorage.name = res.data.name
                        localStorage.accessLevel = res.data.accessLevel
                        localStorage.profilePhoto = res.data.profilePhoto
                        localStorage.token = res.data.token

                        this.setState({ isLoggedIn: true })
                    }
                }
                else {
                    console.log("Login failed")
                }
            })
    }


    render() {
        return (
            <div className="login-container">
                <form className="login-page" noValidate={true} id="loginOrRegistrationForm">
                    <h1>Login</h1>

                    {this.state.isLoggedIn ? <Redirect to="/DisplayAllProducts" /> : null}

                    <div className="input-container">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            autoComplete="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div className="input-container">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="password"
                            value={this.state.password}
                            onChange={this.handleChange}
                        />
                    </div>
                    <LinkInClass value="Sign in" className="sign-in-button" onClick={this.handleSubmit} />
                     <div>
                         <p>Don't have an account? <Link className="create-account-button" to={"/Register"}>Register</Link></p>
                     </div>
                </form>
            </div>
        )
    }
}
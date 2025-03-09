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
            isLoggedIn: false,
            showModal:false,
            modalMessage:""
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
                        this.setState({ showModal: true, modalMessage: res.data.errorMessage })
                        console.log(res.data.errorMessage)
                    } else {
                        localStorage.name = res.data.name
                        localStorage.userId = res.data.userId
                        localStorage.email = res.data.email
                        localStorage.accessLevel = res.data.accessLevel
                        localStorage.token = res.data.token

                        // update profile photo correctly
                        if (res.data.profilePhoto) {
                            localStorage.profilePhoto = res.data.profilePhoto
                        } else {
                            localStorage.removeItem("profilePhoto")
                        }

                        // update state (so react processes redirection)
                        // without this the page cant be redirected to displayAllProducts (will stay at login)
                        this.setState({ isLoggedIn: true }, () => {
                            // delay the refresh to allow redirection to happen
                            setTimeout(() => {
                                window.location.reload()
                            }, 100)
                        })
                    }
                } else {
                    console.log("Login failed")
                }
            })
            .catch(error => console.log("Error logging in:", error))
    }

    handleCloseModal = () => {
        this.setState({ showModal: false, modalMessage: "" })
    }

    render() {
        return (
            <div className="login-container">
                <form className="login-page" noValidate={true} id="loginOrRegistrationForm">
                    <h1>Login</h1>

                    {this.state.isLoggedIn ? <Redirect to="/" /> : null}

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
                        <p>Don't have an account? <Link className="create-account-link" to={"/Register"}>Register</Link></p>
                    </div>
                    <div>
                        <p>admin@admin.com</p>
                        <p>123!"£qweQWE</p>
                    </div>
                    {this.state.showModal && (
                        <div className="modal-overlay">
                            <div className="modal-content">
                                <h4>{this.state.modalMessage}</h4>
                                <button className="orange-button" onClick={this.handleCloseModal}>OK</button>
                            </div>
                        </div>
                    )}
                </form>

            </div>
        )
    }
}
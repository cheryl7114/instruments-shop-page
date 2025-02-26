import React, { Component } from "react"
import { Redirect, Link } from "react-router-dom"
import axios from "axios"

import LinkInClass from "../components/LinkInClass"

import { SERVER_HOST } from "../config/global_constants"


export default class Register extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            selectedFile:null,
            isRegistered: false
        }
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleFileChange = (e) => {
        this.setState({selectedFile: e.target.files[0]})
    }

    handleSubmit = (e) => {
        e.preventDefault()

        let formData = new FormData()
        formData.append("profilePhoto", this.state.selectedFile)

        axios.post(`${SERVER_HOST}/users/register/${this.state.name}/${this.state.email}/${this.state.password}`, formData, {headers: {"Content-type": "multipart/form-data"}})
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else // user successfully registered
                    {
                        console.log("User registered and logged in")

                        localStorage.name = res.data.name
                        localStorage.userId = res.data.user._id
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
                        this.setState({ isRegistered: true }, () => {
                            // delay the refresh to allow redirection to happen
                            setTimeout(() => {
                                window.location.reload()
                            }, 100)
                        })
                    }
                }
                else {
                    console.log("Registration failed")
                }
            })
    }


    render() {
        return (
            <div className="register-container">
                <form className="register-page" noValidate={true} id="loginOrRegistrationForm">

                    {this.state.isRegistered ? <Redirect to="/DisplayAllProducts" /> : null}

                    <h1>Create account</h1>
                    <div className="input-container">
                        <input
                            name="name"
                            type="text"
                            placeholder="Name"
                            autoComplete="name"
                            value={this.state.name}
                            onChange={this.handleChange}
                            ref={(input) => { this.inputToFocus = input }}
                        />
                    </div>
                    <div className="input-container">
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div className="input-container">
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="password"
                            title="Password must be at least ten-digits long and contains at least one lowercase letter, one uppercase letter, one digit and one of the following characters (£!#€$%^&*)"
                            value={this.state.password}
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="input-container">
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            autoComplete="confirmPassword"
                            value={this.state.confirmPassword}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div className="input-container">
                        <input
                            type = "file"
                            onChange = {this.handleFileChange}
                        />
                    </div>

                    <LinkInClass className="register-button" value="Register" onClick={this.handleSubmit} />
                    <Link className="cancel-link" to={"/DisplayAllProducts"}>Cancel</Link>
                </form>
            </div>
        )
    }
}
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
            address: "",
            city: "",
            postcode: "",
            phoneNumber: "",
            selectedFile: null,
            isRegistered: false,
            wasSubmittedAtLeastOnce: false
        }
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleFileChange = (e) => {
        this.setState({ selectedFile: e.target.files[0] })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.setState({ wasSubmittedAtLeastOnce: true })

        const formInputsState = this.validate()
        if (Object.keys(formInputsState).every(key => formInputsState[key])) {
            let formData = new FormData();
            formData.append("profilePhoto", this.state.selectedFile);
            formData.append("name", this.state.name);
            formData.append("email", this.state.email);
            formData.append("password", this.state.password);
            formData.append("address", this.state.address);
            formData.append("city", this.state.city);
            formData.append("postcode", this.state.postcode);
            formData.append("phoneNumber", this.state.phoneNumber);

            axios.post(`${SERVER_HOST}/users/register`, formData, { headers: { "Content-type": "multipart/form-data" } })
                .then(res => {
                    if (res.data) {
                        if (res.data.errorMessage) {
                            console.log(res.data.errorMessage)
                        } else {
                            console.log("User registered and logged in")

                            localStorage.name = res.data.name
                            localStorage.userId = res.data.userId || (res.data.user ? res.data.user._id : null)
                            localStorage.accessLevel = res.data.accessLevel
                            localStorage.token = res.data.token

                            if (res.data.profilePhoto) {
                                localStorage.profilePhoto = res.data.profilePhoto
                            } else {
                                localStorage.removeItem("profilePhoto")
                            }

                            this.setState({ isRegistered: true }, () => {
                                setTimeout(() => {
                                    window.location.href = "/DisplayAllProducts"
                                }, 100)
                            })
                        }
                    } else {
                        console.log("Registration failed")
                    }
                })
        } else {
            console.log("Form validation failed")
        }
    }

    validateName() {
        const pattern = /^[A-Za-zÀ-ž'-]([A-Za-zÀ-ž'-]+)*$/ // Letters, hyphen, apostrophe, min 2 characters
        return pattern.test(String(this.state.name).trim())
    }

    validateEmail() {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Standard email regex
        return pattern.test(String(this.state.email).trim())
    }

    validatePassword() {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@£!#€$%^&*])[A-Za-z\d@£!#€$%^&*]{10,}$/
        return pattern.test(String(this.state.password))
    }

    validateConfirmPassword() {
        return this.state.password === this.state.confirmPassword
    }

    validatePhoneNumber() {
        if (this.state.phoneNumber.trim() === "") {
            return true // Phone Number is optional
        }
        const pattern = /^(?:\+353|0[78])\d{8}$/ // Irish numbers: +353XXXXXXXX or 08XXXXXXXX or 07XXXXXXXX
        return pattern.test(String(this.state.phoneNumber).trim())
    }

    validateAddress() {
        return true // Address is optional
    }

    validate() {
        return {
            name: this.validateName(),
            email: this.validateEmail(),
            password: this.validatePassword(),
            confirmPassword: this.validateConfirmPassword(),
            phoneNumber: this.validatePhoneNumber(),
            address: this.validateAddress()
        }
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
                            placeholder="*Name"
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                        {this.state.wasSubmittedAtLeastOnce && !this.validateName() && (
                            <span className="error">
                                Name must contain only letters, hyphens (-), or apostrophes (').
                            </span>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            name="email"
                            type="email"
                            placeholder="*Email"
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                        {this.state.wasSubmittedAtLeastOnce && !this.validateEmail() && (
                            <span className="error">
                                Enter a valid email address (e.g., example@email.com).
                            </span>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            name="address"
                            type="text"
                            placeholder="Address"
                            value={this.state.address}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div className="input-container">
                        <input
                            name="city"
                            type="text"
                            placeholder="City"
                            value={this.state.city}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div className="input-container">
                        <input
                            name="postcode"
                            type="text"
                            placeholder="Postcode"
                            value={this.state.postcode}
                            onChange={this.handleChange}
                        />
                    </div>

                    <div className="input-container">
                        <input
                            name="phoneNumber"
                            type="tel"
                            placeholder="Phone Number"
                            value={this.state.phoneNumber}
                            onChange={this.handleChange}
                        />
                        {this.state.wasSubmittedAtLeastOnce && !this.validatePhoneNumber() && (
                            <span className="error">
                                Phone number must be Irish and follow one of these formats:
                                <ul>
                                    <li>+353XXXXXXXX</li>
                                    <li>087XXXXXXXX</li>
                                    <li>071XXXXXXXX</li>
                                </ul>
                            </span>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            name="password"
                            type="password"
                            placeholder="*Password"
                            value={this.state.password}
                            onChange={this.handleChange}
                        />
                        {this.state.wasSubmittedAtLeastOnce && !this.validatePassword() && (
                            <span className="error">
                                Password must be at least 10 characters long and contain:
                                <ul>
                                    <li>One uppercase letter</li>
                                    <li>One lowercase letter</li>
                                    <li>One digit</li>
                                    <li>One special character (@£!#€$%^&*)</li>
                                </ul>
                            </span>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="*Confirm Password"
                            value={this.state.confirmPassword}
                            onChange={this.handleChange}
                        />
                        {this.state.wasSubmittedAtLeastOnce && !this.validateConfirmPassword() && (
                            <span className="error">
                                Passwords do not match.
                            </span>
                        )}
                    </div>

                    <div className="input-container">
                        <input
                            type="file"
                            onChange={this.handleFileChange}
                        />
                    </div>

                    <LinkInClass value="Register" className="sign-in-button" onClick={this.handleSubmit} />
                    <Link className="cancel-link" to={"/DisplayAllProducts"}>Cancel</Link>
                </form>
            </div>
        )
    }
}

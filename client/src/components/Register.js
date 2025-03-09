import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

import LinkInClass from "../components/LinkInClass"

import { SERVER_HOST } from "../config/global_constants"
import {CiCircleRemove} from "react-icons/ci"

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
            selectedFiles: [],
            previewImages: [],
            isRegistered: false,
            wasSubmittedAtLeastOnce: false,
            showModal:false,
            modalMessage:""
        }
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value,
            wasSubmittedAtLeastOnce: false })
    }

    handleFileChange = (e) => {
        const selectedFiles = []
        const newPreviews = []

        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files[i]
            if (file instanceof File) {
                selectedFiles.push(file)
                newPreviews.push(URL.createObjectURL(file))
            }
        }

        this.setState(prevState => ({
            selectedFiles: [...prevState.selectedFiles, ...selectedFiles],
            previewImages: [...prevState.previewImages, ...newPreviews]
        }))
    }

    handleRemoveImage = (index) => {
        // Remove preview image from state
        const updatedPreviews = [...this.state.previewImages]
        updatedPreviews.splice(index, 1)

        // Remove filename from images array
        const updatedFiles = [...this.state.selectedFiles]
        updatedFiles.splice(index, 1)

        this.setState({
            previewImages: updatedPreviews,
            selectedFiles: updatedFiles
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.setState({ wasSubmittedAtLeastOnce: true })

        const formInputsState = this.validate()
        if (Object.keys(formInputsState).every(key => formInputsState[key])) {
            let formData = new FormData()
            formData.append("profilePhoto", this.state.selectedFiles[0])
            formData.append("name", this.state.name)
            formData.append("email", this.state.email)
            formData.append("password", this.state.password)
            formData.append("address", this.state.address)
            formData.append("city", this.state.city)
            formData.append("postcode", this.state.postcode)
            formData.append("phoneNumber", this.state.phoneNumber)

            axios.post(`${SERVER_HOST}/users/register`, formData, { headers: { "Content-type": "multipart/form-data" } })
                .then(res => {
                    if (res.data) {
                        if (res.data.errorMessage) {
                            this.setState({
                                showModal: true,
                                modalMessage: res.data.errorMessage,
                                isRegistered:false
                            })
                        } else {
                            this.setState({
                                showModal: true,
                                modalMessage:"Successfully registered and logged in",
                                isRegistered: true
                            })
                            console.log("User registered and logged in")

                            localStorage.name = res.data.name
                            localStorage.email = res.data.email
                            localStorage.userId = res.data.userId || (res.data.user ? res.data.user._id : null)
                            localStorage.accessLevel = res.data.accessLevel
                            localStorage.token = res.data.token

                            if (res.data.profilePhoto) {
                                localStorage.profilePhoto = res.data.profilePhoto
                            } else {
                                localStorage.removeItem("profilePhoto")
                            }

                            this.setState({ isRegistered: true})
                        }
                    } else {
                        console.log("Registration failed")
                    }
                })
        } else {
            console.log("Form validation failed")
        }
    }

    handleCloseModal = () => {
        this.setState({
            showModal: false,
            modalMessage: "",
            wasSubmittedAtLeastOnce: false
        })

        if (this.state.isRegistered) {
            window.location.href = "/"
        }
    }

    validateName() {
        const pattern = /^[A-Za-zÀ-ž'-]+(?: [A-Za-zÀ-ž'-]+)*$/ // Letters, hyphen, apostrophe, min 2 characters
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

                    <h1>Create account</h1>

                    <div className="input-container">
                        <input
                            name="name"
                            type="text"
                            placeholder="*Username"
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                        {this.state.wasSubmittedAtLeastOnce && !this.validateName() && (
                            <span className="error">
                                * Must contain only letters, hyphens (-), or apostrophes (').
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
                                * Invalid email address.
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
                                * Must be an Irish number with one of the formats below:
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
                                * Must be at least 10 characters long and contain:
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
                                * Password does not match.
                            </span>
                        )}
                    </div>


                    <div className="profile-upload-label">
                        <input
                            type="file"
                            id="file-upload"
                            onChange={this.handleFileChange}
                        />
                        <label htmlFor="file-upload" >
                            Click to Upload Profile Picture
                        </label>
                        {/* Image Previews */}
                        <div className="profile-preview-container">
                            {this.state.previewImages.map((img, index) => (
                                <div key={index} className="profile-preview-wrapper">
                                    <img src={img||""} alt="Preview" className="profile-preview" />
                                    <button
                                        type="button"
                                        className="remove-image-button"
                                        onClick={() => this.handleRemoveImage(index)}
                                    >
                                        <CiCircleRemove size={24} color="red" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <LinkInClass value="Register" className="sign-in-button" onClick={this.handleSubmit} />
                    <div className="cancel-button">
                        <Link to={"/DisplayAllProducts"}>
                            <CiCircleRemove size={30} color="red" />
                        </Link>
                    </div>
                </form>
                {this.state.showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>{this.state.modalMessage}</h4>
                            <button className="orange-button" onClick={this.handleCloseModal}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

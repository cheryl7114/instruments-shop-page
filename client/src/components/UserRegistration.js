import React, { Component } from "react"
import { Redirect, Link } from "react-router-dom"
import axios from "axios"
import Form from "react-bootstrap/Form"


import { SERVER_HOST } from "../config/global_constants"


export default class UserRegistration extends Component {
    constructor(props) {
        super(props)

        this.state = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            isRegistered: false
        }
    }


    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }


    handleSubmit = (e) => {
        e.preventDefault()

        axios.post(`${SERVER_HOST}/users/register/${this.state.name}/${this.state.email}/${this.state.password}`)
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else // user successfully registered
                    {
                        console.log("User registered")

                        this.setState({ isRegistered: true })
                    }
                }
                else {
                    console.log("Registration failed")
                }
            })
    }


    render() {
        return (
            <div className="form-container">

                <Form>
                    {this.state.isRegistered ? <Redirect to="/DisplayAllCars" /> : null}

                    <Form.Group controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control ref={(input) => { this.inputToFocus = input }} type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={this.state.email} onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" value={this.state.password} onChange={this.handleChange} />
                    </Form.Group>

                    <Form.Group controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" name="confirmPassword" value={this.state.confirmPassword} onChange={this.handleChange} />
                    </Form.Group>

                    <Link className="green-button" onClick={this.handleSubmit}>Register</Link>
                    <Link className="red-button" to={"/DisplayAllCars"}>Cancel</Link>

                </Form>
            </div>
        )
    }
}
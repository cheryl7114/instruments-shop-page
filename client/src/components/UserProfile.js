import React, {Component} from "react"
import {Link} from "react-router-dom"

import axios from "axios"

import Logout from "./Logout"

import {ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST} from "../config/global_constants"

export default class UserProfile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user: {}
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/users/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        this.setState({ user: res.data })
                        console.log("User details retrieved")
                    }
                } else {
                    console.log("User not found")
                }
            })
            .catch(err => console.error("Error fetching user:", err))
    }

    render() {
        const { user } = this.state

        return (
            <div className="body-container">
                <div className="sidebar-container">
                    <h1>User Profile</h1>
                    <div className="sidebar-with-content">
                        <div className="sidebar">
                            <h2>Hi, {user.name}!</h2>
                            <hr></hr>
                            <p>Account Details</p>
                            <p>Purchase History</p>
                            <p>My Orders</p>
                            <p>Returns</p>
                        </div>
                        <div className="content">
                            {user.profilePhoto ? (
                                <img src={`data:image/png;base64,${user.profilePhoto}`} alt="Profile" className="profile-photo" />
                            ) : (
                                <p>No profile photo</p>
                            )}
                            <p>Name: {user.name}</p>
                            <p>Email: {user.email}</p>
                            <Logout />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

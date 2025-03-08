import React, { Component } from "react"
import { Redirect } from "react-router-dom"
import axios from "axios"

import { SERVER_HOST } from "../config/global_constants"

export default class DeleteUser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            redirectToDisplayAllUsers: false
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/users/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        console.log("Response Data: ", res.data)
                        // Delete profile picture if it exists
                        const deleteProfilePicPromise = res.data.profilePhotoFilename
                            ? axios.delete(`${SERVER_HOST}/users/profile-pic/${res.data.profilePhotoFilename}`, { headers: { "authorization": localStorage.token } })
                                .then(deleteRes => {
                                    console.log("Profile pic delete response: ", deleteRes.data)
                                    return deleteRes.data  // Ensure it returns the correct response
                                })
                                .catch(err => {
                                    console.error("Failed to delete profile pic:", err)
                                    return Promise.reject(err)  // Reject the promise to stop the user deletion flow if the profile picture delete fails
                                })
                            : Promise.resolve()

                        // Ensure profile pic is deleted before deleting the user
                        deleteProfilePicPromise
                            .then(() => {
                                return axios.delete(`${SERVER_HOST}/users/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
                            })
                            .then(deleteRes => {
                                if (deleteRes.data) {
                                    if (deleteRes.data.errorMessage) {
                                        console.log(deleteRes.data.errorMessage)
                                    } else {
                                        console.log("User deleted")
                                        this.setState({ redirectToDisplayAllUsers: true })
                                    }
                                } else {
                                    console.log("User not deleted")
                                }
                            })
                            .catch(err => {
                                console.error("Failed to delete user:", err)
                            })
                    }
                } else {
                    console.log("User not found")
                }
            })
            .catch(err => {
                console.error("Error fetching user data:", err)
            })
    }

    render() {
        return (
            <div>
                {this.state.redirectToDisplayAllUsers ? <Redirect to="/ViewCustomers" /> : null}
            </div>
        )
    }
}

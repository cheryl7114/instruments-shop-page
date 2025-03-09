import React, { Component } from "react"
import {Redirect} from "react-router-dom"
import axios from "axios"

import { SERVER_HOST } from "../config/global_constants"
import {CiCircleRemove} from "react-icons/ci"

export default class DeleteUser extends Component {
    constructor(props) {
        super(props)

        this.state = {
            user:null,
            redirectToUserProfile: false,
            redirectPath: "",
            showSuccessModal: false,
            showConfirmationModal: false,
            modalMessage: ""
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/users/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        this.setState({ user: res.data, showConfirmationModal: true })
                    }
                } else {
                    console.log("User not found")
                }
            })
            .catch(err => {
                console.error("Error fetching user data:", err)
            })

        const adminId = localStorage.userId
        if (adminId) {
            this.setState({ adminId })
        } else {
            console.error("Admin ID not found in localStorage")
        }
    }

    handleDeleteUser = () => {
        axios.delete(`${SERVER_HOST}/users/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
            .then(deleteRes => {
                if (deleteRes.data) {
                    if (deleteRes.data.errorMessage) {
                        console.log(deleteRes.data.errorMessage);
                    } else {
                        console.log("User deleted")
                        this.setState({ showConfirmationModal: false, showSuccessModal: true, modalMessage: "User successfully deleted" })
                    }
                } else {
                    console.log("User not deleted")
                }
            })
            .catch(err => {
                console.error("Failed to delete user:", err)
            })
    }


    handleCloseModal = () => {
        if (this.state.adminId) {
            this.setState({
                showSuccessModal: false,
                redirectToUserProfile: true,
                redirectPath: `/UserProfile/${this.state.adminId}/view-customers`
            })
        } else {
            console.error("Admin ID not found, staying on the same page.")
            this.setState({
                showSuccessModal: false,
                showConfirmationModal: false
            })
        }
    }

    render() {

    if (this.state.redirectToUserProfile) {
        return <Redirect to={this.state.redirectPath} />
    }

        return (
            <div>
                {this.state.showConfirmationModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>Are you sure you want to delete {this.state.user?.name || "this user"}?</h4>
                            <p>This action cannot be undone.</p>
                            <button className="orange-button" onClick={this.handleDeleteUser}>Yes</button>
                            <button className="cancel-button" onClick={this.handleCloseModal}>
                                <CiCircleRemove size={30} color="red" />
                            </button>
                        </div>
                    </div>
                )}

                {this.state.showSuccessModal && (
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

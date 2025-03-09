import React, { Component } from "react"
import {ACCESS_LEVEL_ADMIN} from "../config/global_constants"

export default class AccountDetails extends Component {
    render() {
        const { user } = this.props
        return (
            <div>
                <h2>Account Details</h2><br/>
                {user.profilePhoto ? (
                    <img src={`data:image/png;base64,${user.profilePhoto}`} alt="Profile" className="profile-photo" />
                ) : (
                    <p>No profile photo</p>
                )}
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ? null : (
                    // Only customers have further details
                    // Check if user.deliveryAddress exists before trying to access address, city, or postcode
                    <>
                        <p>Address: {user.deliveryAddress?.address ? user.deliveryAddress.address : "Not available"}</p>
                        <p>City: {user.deliveryAddress?.city ? user.deliveryAddress.city : "Not available"}</p>
                        <p>Postcode: {user.deliveryAddress?.postcode ? user.deliveryAddress.postcode : "Not available"}</p>
                        <p>Phone Number: {user.phoneNumber ? user.phoneNumber : "Not available"}</p>
                    </>
                )}
            </div>
        )
    }
}
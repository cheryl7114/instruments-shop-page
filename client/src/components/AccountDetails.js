import React, { Component } from "react"

export default class AccountDetails extends Component {
    render() {
        const { user } = this.props
        return (
            <div>
                <h2>Account Details</h2>
                {user.profilePhoto ? (
                    <img src={`data:image/png;base64,${user.profilePhoto}`} alt="Profile" className="profile-photo" />
                ) : (
                    <p>No profile photo</p>
                )}
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
            </div>
        )
    }
}
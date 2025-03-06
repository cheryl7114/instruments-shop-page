import React, { Component } from "react"
import axios from "axios";
import {SERVER_HOST} from "../config/global_constants";

export default class ViewCustomers extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: []
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/users`)
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else {
                        console.log("Records read")
                        this.setState({ users: res.data })
                    }
                }
                else {
                    console.log("Record not found")
                }
            })
    }

    render() {
        const users = this.state.users
        return(
            <div>
                <h2>View Customers</h2>
                <ul>
                    {users.length > 0 ? (
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user, index) => (
                                user.accessLevel === 1? (  // Don't show admin users, only show customers
                                    <tr key={index}>
                                        {user.profilePhoto ? (
                                            <img src={`data:image/png;base64,${user.profilePhoto}`} alt="Profile" className="profile-photo" />
                                        ) : (
                                            <p>No photo</p>
                                        )}
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                    </tr>
                                    ) : null
                            ))}
                            </tbody>
                        </table>
                        ) : (
                            <p>No customers found.</p>
                        )
                    }
                </ul>
            </div>
        )
    }
}

import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import {CiTrash} from "react-icons/ci"
import {Link} from "react-router-dom"

export default class ViewCustomers extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: []
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/users`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        console.log("Records read")
                        this.setState({ users: res.data })
                    }
                } else {
                    console.log("Record not found")
                }
            })
    }

    render() {
        const users = this.state.users
        return (
            <div className="table-container">
                <h2>View Customers</h2>
                    {users.length > 0 ? (
                        <table>
                            <thead>
                            <tr>
                                <th>Profile Pic</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>City</th>
                                <th>Postcode</th>
                                <th>Phone Number</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user, index) => (
                                user.accessLevel === 1 ? (  // Don't show admin users, only show customers
                                    <tr key={index}>
                                        {user.profilePhoto ? (
                                            <td><img src={`data:image/png;base64,${user.profilePhoto}`} alt="Profile" className="profile-photo" /></td>
                                        ) : (
                                            <td>No photo</td>
                                        )}
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.deliveryAddress?.address ? user.deliveryAddress.address : "Not available"}</td>
                                        <td>{user.deliveryAddress?.city ? user.deliveryAddress.city : "Not available"}</td>
                                        <td>{user.deliveryAddress?.postcode ? user.deliveryAddress.postcode : "Not available"}</td>
                                        <td>{user.phoneNumber ? user.phoneNumber : "Not available"}</td>
                                        <td>
                                            {/*{user.id ? user.id: "No id"}*/}
                                            <Link className="delete-button" to={`/DeleteCustomer/${user._id}`}>
                                                <CiTrash size={25} />
                                            </Link>
                                        </td>
                                    </tr>
                                ) : null
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="no-customers">No customers found.</p>
                    )}
            </div>
        )
    }
}

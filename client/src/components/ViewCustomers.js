import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import { CiTrash } from "react-icons/ci"
import { Link } from "react-router-dom"

export default class ViewCustomers extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: [],
            expandedRow: null // Track which row is expanded
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

    toggleRow(index) {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    render() {
        const { users, expandedRow } = this.state

        return (
            <div className="table-container">
                <h2>View Customers</h2><br/>
                <i><p>Click on rows to expand for full details.</p></i>
                {users.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Profile Pic</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {users.map((user, index) =>
                            user.accessLevel === 1 ? ( // Show only customers, not admins
                                <>
                                    {/* Main row (clickable) */}
                                    <tr className="clickable-row" onClick={() => this.toggleRow(index)}>
                                        <td>
                                            {user.profilePhoto ? (
                                                <img src={`data:image/png;base64,${user.profilePhoto}`} alt="Profile" className="profile-photo" />
                                            ) : "No photo"}
                                        </td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <Link className="delete-button" to={`/DeleteCustomer/${user._id}`}>
                                                <CiTrash size={25} />
                                            </Link>
                                        </td>
                                    </tr>

                                    {/* Expanded row (shown only if expandedRow === index) */}
                                    {expandedRow === index && (
                                        <tr className="expanded-row">
                                            <td colSpan="4">
                                                <strong>Address:</strong> {user.deliveryAddress?.address || "Not available"},
                                                {user.deliveryAddress?.city || "Not available"},
                                                {user.deliveryAddress?.postcode || "Not available"}
                                                <br />
                                                <strong>Phone:</strong> {user.phoneNumber || "Not available"}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ) : null
                        )}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-customers">No customers found.</p>
                )}
            </div>
        )
    }
}

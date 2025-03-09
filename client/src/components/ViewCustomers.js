import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import {  CiTrash , CiSearch } from "react-icons/ci"
import {  Link  } from "react-router-dom"

export default class ViewCustomers extends Component {
    constructor(props) {
        super(props)

        this.state = {
            users: [],
            expandedRow: null, // Track which row is expanded,
            filteredUsers: [],
            searchQuery: ""
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
                        this.setState({
                            users: res.data,
                            filteredUsers: res.data
                        })
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

    handleSearchChange = (e) => {
        const query = e.target.value
        this.setState({ searchQuery: query }, () => {
            this.filterUsers()
        })
    }

    filterUsers = () => {
        const { users, searchQuery } = this.state
        const filteredUsers = users.filter(user => {
            return (
                // Only include customers (accessLevel 1)
                user.accessLevel === 1 && (
                    // Search in various fields
                    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (user.deliveryAddress?.city && user.deliveryAddress.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            )
        })
        this.setState({ filteredUsers })
    }

    render() {
        const { filteredUsers, searchQuery, expandedRow } = this.state
        return (
            <div className="table-container">
                <h2>View Customers</h2><br />
                <div className="customer-search-bar">
                    <CiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, city, or phone number..."
                        value={searchQuery}
                        onChange={this.handleSearchChange}
                    />
                </div>
                <ul>
                    {filteredUsers.length > 0 ? (
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
                                {filteredUsers.map((user, index) => (
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
                </ul>
            </div>
        )
    }
}

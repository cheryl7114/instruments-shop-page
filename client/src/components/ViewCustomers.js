import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import { CiTrash, CiSearch } from "react-icons/ci"
import { Link } from "react-router-dom"

export default class ViewCustomers extends Component {
    constructor(props) {
        super(props)
        this.state = {
            users: [],
            filteredUsers: [],
            searchQuery: "",
            expandedRow: null,
            sortKey: "name",
            sortOrder: "desc"
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

        // Only filter if there's actually a search query
        if (!searchQuery.trim()) {
            this.setState({ filteredUsers: users.filter(user => user.accessLevel === 1) })
            return
        }

        const query = searchQuery.toLowerCase();
        const filteredUsers = users.filter(user => {
            // Only consider customers
            if (user.accessLevel !== 1) {
                return false
            }

            // Search in main row data
            const nameMatch = user.name && user.name.toLowerCase().includes(query)
            const emailMatch = user.email && user.email.toLowerCase().includes(query)

            // Search in expanded row data
            const addressMatch = user.deliveryAddress?.address &&
                user.deliveryAddress.address.toLowerCase().includes(query)
            const cityMatch = user.deliveryAddress?.city &&
                user.deliveryAddress.city.toLowerCase().includes(query)
            const postcodeMatch = user.deliveryAddress?.postcode &&
                user.deliveryAddress.postcode.toLowerCase().includes(query)
            const phoneMatch = user.phoneNumber &&
                user.phoneNumber.toLowerCase().includes(query)

            // Return true if any field matches
            return nameMatch || emailMatch || addressMatch || cityMatch || postcodeMatch || phoneMatch
        })
        this.setState({ filteredUsers })
    }

    sortData = (data, key, order) => {
        return [...data].sort((a, b) => {
            let valueA, valueB

            if (key === 'name') {
                valueA = a[key].toLowerCase()
                valueB = b[key].toLowerCase()
            } else if (key === 'email') {
                valueA = a[key].toLowerCase()
                valueB = b[key].toLowerCase()
            }

            // Sort based on direction
            if (order === 'asc') {
                return valueA > valueB ? 1 : -1
            } else {
                return valueB > valueA ? 1 : -1
            }

        })
    }

    handleSortIndicator = (currentKey) => {
        this.setState(prevState => {
            const newSortOrder = prevState.sortKey === currentKey && prevState.sortOrder === 'asc' ? 'desc' : 'asc'
            const sortedUsers = this.sortData(prevState.users, currentKey, newSortOrder)
            const sortedFilteredUsers = this.sortData(prevState.filteredUsers, currentKey, newSortOrder)

            return {
                users: sortedUsers,
                filteredUsers: sortedFilteredUsers,
                sortKey: currentKey,
                sortOrder: newSortOrder
            }
        })
    }

    render() {
        const { filteredUsers, searchQuery, expandedRow } = this.state
        const getSortIndicator = (key) => {
            if (this.state.sortKey === key) {
                return this.state.sortOrder === 'asc' ? '▲' : '▼'
            }
            return ''
        }
        return (
            <div className="table-container">
                <h2>View Customers</h2><br />
                <i><p>Click on rows to view full details.</p></i>
                <div className="customer-search-bar">
                    <CiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, city, or phone number..."
                        value={searchQuery}
                        onChange={this.handleSearchChange}
                    />
                </div><br />
                {filteredUsers.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Profile Pic</th>
                                <th className="sort-pointer" onClick={() => this.handleSortIndicator("name")}>Name{getSortIndicator("name")}</th>
                                <th className="sort-pointer" onClick={() => this.handleSortIndicator("email")}>Email{getSortIndicator("email")}</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, index) => (
                                user.accessLevel === 1 ? (
                                    <>
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

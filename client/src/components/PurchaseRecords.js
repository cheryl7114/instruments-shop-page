import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import { CiSearch } from "react-icons/ci"

export default class PurchaseRecords extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            filteredOrders: [],
            expandedRow: null,
            searchQuery: "",
            sortKey: "orderDate",
            sortOrder: "desc",
            userTypeFilter: "all"
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/orders`, { headers: { authorization: localStorage.token } })
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ orders: res.data, filteredOrders: res.data })
                }
            })
            .catch(err => this.setState({ error: "Error fetching orders" }))
    }

    toggleRow(index) {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    handleSearchChange = (e) => {
        const query = e.target.value
        this.setState({ searchQuery: query }, () => {
            this.filterOrders()
        })
    }

    handleUserTypeFilterChange = (filterType) => {
        this.setState({ userTypeFilter: filterType }, () => {
            this.filterOrders()
        })
    }

    filterOrders = () => {
        const { orders, searchQuery, userTypeFilter, sortKey, sortOrder } = this.state

        // First, filter by user type
        let filteredByUserType = orders

        if (userTypeFilter === "guest") {
            filteredByUserType = orders.filter(order => !order.userId) // Guest orders don't have userId
        } else if (userTypeFilter === "user") {
            filteredByUserType = orders.filter(order => order.userId) // User orders have userId
        }

        // Then apply search filter
        if (!searchQuery.trim()) {
            // If no search query, just use the user type filter
            const sortedOrders = this.sortData(filteredByUserType, sortKey, sortOrder)
            this.setState({ filteredOrders: sortedOrders })
            return
        }

        const query = searchQuery.toLowerCase()

        const finalFiltered = filteredByUserType.filter(order => {
            const nameMatch = order.name && order.name.toLowerCase().includes(query)
            const emailMatch = order.email && order.email.toLowerCase().includes(query)
            const productMatch = order.products && order.products.some(product => {
                return (
                    (product.productID?.name &&
                        product.productID.name.toLowerCase().includes(query)) ||
                    (product.name &&
                        product.name.toLowerCase().includes(query))
                )
            })

            return nameMatch || emailMatch || productMatch
        })

        // Sort the results
        const sortedOrders = this.sortData(finalFiltered, sortKey, sortOrder)
        this.setState({ filteredOrders: sortedOrders })
    }


    sortData = (data, key, order) => {
        return [...data].sort((a, b) => {
            let valueA, valueB

            if (key === 'orderDate') {
                valueA = new Date(a[key])
                valueB = new Date(b[key])
            } else if (key === 'total') {
                valueA = a.total
                valueB = b.total
            } else if (key === 'email') {
                valueA = a[key].toLowerCase()
                valueB = b[key].toLowerCase()
            } else {
                valueA = a[key]
                valueB = b[key]
            }

            // sort based on direction
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

            const sortedOrders = this.sortData(prevState.orders, currentKey, newSortOrder)
            const sortedFilteredOrders = this.sortData(prevState.filteredOrders, currentKey, newSortOrder)

            return {
                orders: sortedOrders,
                filteredOrders: sortedFilteredOrders,
                sortKey: currentKey,
                sortOrder: newSortOrder,
            }
        })
    }

    render() {
        const { filteredOrders, expandedRow, searchQuery, sortKey, sortOrder, userTypeFilter } = this.state
        const getSortIndicator = (currentKey) => {
            if (sortKey === currentKey) {
                return sortOrder === 'asc' ? '▲' : '▼'
            }
        }

        return (
            <div className="table-container">
                <h2>Purchase Records</h2><br />
                <div className="customer-search-bar">
                    <CiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or product name..."
                        value={searchQuery}
                        onChange={this.handleSearchChange}
                    />
                </div><br />

                <div className="order-filter-buttons">
                    <button
                        className={`filter-button ${userTypeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => this.handleUserTypeFilterChange('all')}
                    >
                        All Orders
                    </button>
                    <button
                        className={`filter-button ${userTypeFilter === 'user' ? 'active' : ''}`}
                        onClick={() => this.handleUserTypeFilterChange('user')}
                    >
                        Registered Users
                    </button>
                    <button
                        className={`filter-button ${userTypeFilter === 'guest' ? 'active' : ''}`}
                        onClick={() => this.handleUserTypeFilterChange('guest')}
                    >
                        Guest Orders
                    </button>
                </div>
                <i><p>Click on rows to view full details.</p></i>
                {filteredOrders.length === 0 ? (
                    <p className="no-customers">No purchase records available.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th className="sort-pointer" onClick={() => this.handleSortIndicator('email')}>Email{getSortIndicator("email")}</th>
                                <th className="sort-pointer" onClick={() => this.handleSortIndicator('total')}>Total{getSortIndicator('total')}</th>
                                <th className="sort-pointer" onClick={() => this.handleSortIndicator('orderDate')}>Order Date{getSortIndicator('orderDate')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => (
                                <>
                                    <tr key={index} className="clickable-row" onClick={() => this.toggleRow(index)}>
                                        <td>{order._id}</td>
                                        <td>{order.email}</td>
                                        <td>€{order.total.toFixed(2)}</td>
                                        <td>{new Date(order.orderDate).toLocaleString()}</td>
                                    </tr>

                                    {/* Expanded Row (only visible if expandedRow === index) */}
                                    {expandedRow === index && (
                                        <tr className="expanded-row">
                                            <td colSpan="4">
                                                <div className="expanded-row-details">
                                                    <div className="address-details">
                                                        <strong>Name:</strong> {order.name}<br />
                                                        <strong>Address:</strong> {order.deliveryAddress?.address || "Not available"}, {order.deliveryAddress?.city || "Not available"}, {order.deliveryAddress?.postcode || "Not available"}<br />
                                                        <strong>Phone:</strong> {order.phoneNumber || "Not available"}<br />
                                                        <strong>Payment ID: </strong> {order.paypalPaymentID || "Not available"}<br />
                                                    </div>

                                                    <div className="product-details">
                                                        <strong>Product(s) Bought:</strong>
                                                        <ul>
                                                            {order.products.map((product, i) => (
                                                                <li key={i} className="product-item">
                                                                    <li key={i} className="product-item">
                                                                        {product.productID?.name || "Removed Product"} - {product.quantity} × €{product.price.toFixed(2)}
                                                                    </li>
                                                                    {/*<strong>Product ID:</strong> {product.productID} |*/}
                                                                    {/*<strong> Quantity:</strong> {product.quantity} |*/}
                                                                    {/*<strong> Price:</strong> €{product.price.toFixed(2)}*/}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }
}

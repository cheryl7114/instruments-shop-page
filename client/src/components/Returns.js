import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import { CiSearch } from "react-icons/ci"

export default class Returns extends Component {
    constructor(props) {
        super(props)
        this.state = {
            returns: [],
            filteredReturns: [],
            expandedRow: null,
            error: "",
            searchQuery: "",
            sortKey: "returnDate",
            sortOrder: "desc"
        }
    }

    componentDidMount() {
        axios.post(`${SERVER_HOST}/returns/history`, { userId: localStorage.getItem("userId") })
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ returns: res.data, filteredReturns: res.data })
                }
            })
            .catch(() => this.setState({ error: "Error fetching return history" }))
    }

    toggleRow = (index) => {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    handleSearchChange = (e) => {
        const query = e.target.value
        this.setState({ searchQuery: query }, () => {
            this.filterReturns()
        })
    }

    filterReturns = () => {
        const { returns, searchQuery } = this.state

        // If search query is empty, show all returns
        if (!searchQuery.trim()) {
            this.setState({ filteredReturns: returns })
            return
        }

        const query = searchQuery.toLowerCase()
        const filteredReturns = returns.filter(returnRequest => {
            // Search in return ID
            const returnIdMatch = returnRequest._id && returnRequest._id.toLowerCase().includes(query)

            // Search in order ID
            const orderIdMatch = returnRequest.orderId && returnRequest.orderId.toLowerCase().includes(query)

            // Search in product name
            const productNameMatch = returnRequest.productId?.name &&
                returnRequest.productId.name.toLowerCase().includes(query)

            // Return true if any field matches - only including the requested fields
            return returnIdMatch || orderIdMatch || productNameMatch
        })

        this.setState({ filteredReturns })
    }

    sortData = (data, key, order) => {
        return [...data].sort((a, b) => {
            let valueA, valueB

            if (key === 'returnDate') {
                valueA = new Date(a[key])
                valueB = new Date(b[key])
            } else if (key === 'refundAmount') {
                valueA = a[key]
                valueB = b[key]
            } else if (key === '_id') {
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
            const sortedReturns = this.sortData(prevState.returns, currentKey, newSortOrder)
            const sortedFilteredReturns = this.sortData(prevState.filteredReturns, currentKey, newSortOrder)

            return {
                returns: sortedReturns,
                filteredReturns: sortedFilteredReturns,
                sortKey: currentKey,
                sortOrder: newSortOrder
            }
        })
    }

    render() {
        const { filteredReturns, expandedRow, error, sortKey, sortOrder, searchQuery } = this.state

        const getSortIndicator = (currentKey) => {
            if (sortKey === currentKey) {
                return sortOrder === 'asc' ? '▲' : '▼'
            }
            return ''
        }

        return (
            <div className="table-container">
                <h2>Returns</h2>
                <p><i>Click on a row to view full details.</i></p>

                {error && <p className="error">{error}</p>}

                <div className="customer-search-bar">
                    <CiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by return ID, order ID, or product name..."
                        value={searchQuery}
                        onChange={this.handleSearchChange}
                    />
                </div><br />

                {filteredReturns.length === 0 ? (
                    <p className="no-returns">No return records found.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('_id')}>Return ID{getSortIndicator('_id')}</th>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('returnDate')}>Refund Date{getSortIndicator('returnDate')}</th>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('refundAmount')}>Refund Amount (€){getSortIndicator('refundAmount')}</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredReturns.map((returnRequest, index) => (
                            <>
                                <tr key={returnRequest._id} className="clickable-row" onClick={() => this.toggleRow(index)}>
                                    <td>{returnRequest._id}</td>
                                    <td>{new Date(returnRequest.returnDate).toLocaleString() || "Invalid Date"}</td>
                                    <td>€{returnRequest.refundAmount.toFixed(2)}</td>
                                    <td>{returnRequest.status || "Pending"}</td>
                                </tr>

                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="4">
                                            <div className="expanded-row-details">
                                                <div className="address-details">
                                                    <strong>Order ID:</strong> {returnRequest.orderId}<br />
                                                    <strong>Reason for Return:</strong> {returnRequest.reason}<br />
                                                    <strong>Return Date:</strong> {new Date(returnRequest.returnDate).toLocaleString()}
                                                </div>

                                                <div className="product-details">
                                                    <strong>Product(s):</strong> <br />
                                                    <ul>
                                                        <li className="product-item">{returnRequest.productId?.name || "Removed Product"} - {returnRequest.quantity} × €{returnRequest.refundAmount.toFixed(2)}</li>
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
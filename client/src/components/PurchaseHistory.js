import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import {Link} from "react-router-dom"

export default class PurchaseHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            expandedRow: null,
            error: "",
            sortKey: "orderDate",
            sortOrder: "desc",
            filteredOrders: []
        }
    }

    componentDidMount() {
        axios.post(`${SERVER_HOST}/orders/history`, { userId: localStorage.getItem("userId") })
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ orders: res.data, filteredOrders: res.data })
                }
            })
            .catch(() => this.setState({ error: "Error fetching purchase history" }))
    }

    toggleRow = (index) => {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    isReturnEligible(orderDate) {
        const currentDate = new Date()
        const orderDateObj = new Date(orderDate)
        const twoWeeksAgo = new Date(currentDate.setDate(currentDate.getDate() - 14))

        return orderDateObj >= twoWeeksAgo
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
                sortOrder: newSortOrder
            }
        })
    }

    render() {
        const { filteredOrders, expandedRow, error, sortKey, sortOrder } = this.state
        const getSortIndicator = (currentKey) => {
            if (sortKey === currentKey) {
                return sortOrder === 'asc' ? '▲' : '▼'
            }
        }

        return (
            <div className="table-container">
                <h2>Purchase History</h2>
                <p><i>Click on an order to view full details.</i></p>

                {error && <p className="error">{error}</p>}

                {filteredOrders.length === 0 ? (
                    <p className="no-orders">No purchase history available.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('orderDate')}>Order Date{getSortIndicator('orderDate')}</th>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('total')}>Total (€){getSortIndicator('total')}</th>
                            <th>Return?</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.map((order, index) => (
                            <>
                                <tr key={order._id} className="clickable-row" onClick={() => this.toggleRow(index)}>
                                    <td>{order._id}</td>
                                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                                    <td>€{order.total.toFixed(2)}</td>
                                    <td>
                                        {this.isReturnEligible(order.orderDate) ? (
                                            <Link className="return-link" to={`/ReturnForm/${order._id}`}>
                                                Return
                                            </Link>
                                        ) : (
                                            <span>Not Eligible</span>
                                        )}
                                    </td>
                                </tr>

                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="4">
                                            <div className="expanded-row-details">
                                                <div className="address-details">
                                                    <strong>Delivery Address:</strong> {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.postcode}<br />
                                                    <strong>Phone:</strong> {order.phoneNumber}<br />
                                                    <strong>Payment ID:</strong> {order.paypalPaymentID}<br />
                                                </div>

                                                <div className="product-details">
                                                    <strong>Product(s) Bought:</strong>
                                                    <ul>
                                                        {order.products && order.products.length > 0 ? (
                                                            order.products.map((product, i) => (
                                                                <li key={i} className="product-item">
                                                                    {product.productID?.name || "Removed Product"} - {product.quantity} × €{product.price.toFixed(2)}
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li>No products found for this order.</li>
                                                        )}
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

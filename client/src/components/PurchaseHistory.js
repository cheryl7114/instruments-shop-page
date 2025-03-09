import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"

export default class PurchaseHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            expandedRow: null,
            error: "",
            sortKey: "orderDate",
            sortOrder: "desc"
        }
    }

    componentDidMount() {
        axios.post(`${SERVER_HOST}/orders/history`, {userId: localStorage.getItem("userId")})
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ orders: res.data })
                }
            })
            .catch(() => this.setState({ error: "Error fetching purchase history" }))
    }

    toggleRow = (index) => {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    handleSortIndicator = (currentKey) => {
        this.setState(prevState => {
            const newSortOrder = prevState.sortKey === currentKey && prevState.sortOrder === 'asc' ? 'desc' : 'asc'

            const sortedOrders = [...prevState.orders].sort((a, b) => {
                let valueA, valueB

                if (currentKey === 'orderDate') {
                    valueA = new Date(a[currentKey])
                    valueB = new Date(b[currentKey])
                } else if (currentKey === 'total') {
                    valueA = a.total
                    valueB = b.total
                }

                // sort based on direction
                if (newSortOrder === 'asc') {
                    return valueA > valueB ? 1 : -1
                } else {
                    return valueB > valueA ? 1 : -1
                }
            })
            return {
                orders: sortedOrders,
                sortKey: currentKey,
                sortOrder: newSortOrder
            }
        })
    }

    render() {
        const { orders, expandedRow, error, sortKey, sortOrder } = this.state
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

                {orders.length === 0 ? (
                    <p className="no-orders">No purchase history available.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('orderDate')}>Order Date{getSortIndicator('orderDate')}</th>
                            <th className="sort-pointer" onClick={() => this.handleSortIndicator('total')}>Total (€){getSortIndicator('total')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, index) => (
                            <>
                                <tr className="clickable-row" onClick={() => this.toggleRow(index)} currentKey={index}>
                                    <td>{order._id}</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>€{order.total.toFixed(2)}</td>
                                </tr>

                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="3">
                                            <div className="order-details">
                                                <p><strong>Delivery Address:</strong></p>
                                                <p>{order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.postcode}</p>
                                                <p><strong>Phone:</strong> {order.phoneNumber}</p>
                                                <p><strong>Payment ID:</strong> {order.paypalPaymentID}</p>

                                                <p><strong>Products:</strong></p>
                                                <ul>
                                                    {order.products.map((product, i) => (
                                                        <li currentKey={i}>
                                                            {product.productID?.name || "Unknown Product"} - {product.quantity} × €{product.price.toFixed(2)}
                                                        </li>
                                                    ))}
                                                </ul>
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

import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"

export default class PurchaseHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            expandedRow: null,
            error: ""
        }
    }

    componentDidMount() {
        axios.post(`${SERVER_HOST}/orders/history`, { userId: localStorage.getItem("userId") })
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

    render() {
        const { orders, expandedRow, error } = this.state

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
                            <th>Order Date</th>
                            <th>Total (€)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, index) => (
                            <>
                                <tr key={order._id} className="clickable-row" onClick={() => this.toggleRow(index)}>
                                    <td>{order._id}</td>
                                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                                    <td>€{order.total.toFixed(2)}</td>
                                </tr>

                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="3">
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

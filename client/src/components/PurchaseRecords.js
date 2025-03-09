import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"

export default class PurchaseRecords extends Component {
    constructor(props) {
        super(props)
        this.state = {
            orders: [],
            expandedRow: null
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/orders`, { headers: { authorization: localStorage.token } })
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ orders: res.data })
                }
            })
            .catch(err => this.setState({ error: "Error fetching orders" }))
    }

    toggleRow(index) {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    render() {
        const { orders, expandedRow } = this.state

        return (
            <div className="table-container">
                <h2>Purchase Records</h2><br />
                <i><p>Click on rows to view full details.</p></i>
                {orders.length === 0 ? (
                    <p className="no-customers">No purchase records available.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, index) => (
                            <>
                                <tr key={index} className="clickable-row" onClick={() => this.toggleRow(index)}>
                                    <td>{order._id}</td>
                                    <td>{order.name}</td>
                                    <td>{order.email}</td>
                                    <td>€{order.total.toFixed(2)}</td>
                                </tr>

                                {/* Expanded Row (only visible if expandedRow === index) */}
                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="4">
                                            <div className="expanded-row-details">
                                                <div className="address-details">
                                                    <strong>Address:</strong> {order.deliveryAddress?.address || "Not available"}, {order.deliveryAddress?.city || "Not available"}, {order.deliveryAddress?.postcode || "Not available"}<br />
                                                    <strong>Phone:</strong> {order.phoneNumber || "Not available"}<br />
                                                    <strong>Payment ID: </strong> {order.paypalPaymentID || "Not available"}<br/>
                                                    <strong>Order Date: </strong> {order.orderDate}
                                                </div>

                                                <div className="product-details">
                                                    <strong>Products Bought:</strong>
                                                    <ul>
                                                        {order.products.map((product, idx) => (
                                                            <li key={idx} className="product-item">
                                                                <strong>Product ID:</strong> {product.productID} |
                                                                <strong> Quantity:</strong> {product.quantity} |
                                                                <strong> Price:</strong> €{product.price.toFixed(2)}
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

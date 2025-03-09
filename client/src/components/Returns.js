import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import { Link } from "react-router-dom"

export default class Returns extends Component {
    constructor(props) {
        super(props)
        this.state = {
            returns: [],
            expandedRow: null,
            error: ""
        }
    }

    componentDidMount() {
        axios.post(`${SERVER_HOST}/returns/history`, { userId: localStorage.getItem("userId") })
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ returns: res.data })
                }
            })
            .catch(() => this.setState({ error: "Error fetching return history" }))
    }

    toggleRow = (index) => {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index
        }))
    }

    render() {
        const { returns, expandedRow, error } = this.state

        return (
            <div className="table-container">
                <h2>Returns</h2>
                <p><i>Click on a row to view full details.</i></p>

                {error && <p className="error">{error}</p>}

                {returns.length === 0 ? (
                    <p className="no-returns">No return history available.</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Return ID</th>
                            <th>Refund Date</th>
                            <th>Refund Amount (€)</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {returns.map((returnRequest, index) => (
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

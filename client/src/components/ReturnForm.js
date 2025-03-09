import React, { Component } from "react"
import axios from "axios"
import { SERVER_HOST } from "../config/global_constants"
import { Redirect } from "react-router-dom"
import {CiCircleChevDown} from "react-icons/ci"

export default class ReturnForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            order: null,
            selectedProduct: null,
            quantity: 1,
            reason: "",
            refundAmount: 0,
            error: "",
            redirectToUserProfile: false,
            userId: localStorage.getItem("userId"),
            showModal:false
        }
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/orders/${this.props.match.params.id}`)
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ order: res.data })
                }
            })
            .catch(err => {
                console.error("Error fetching order details:", err)
                this.setState({ error: "Error fetching order details" })
            })
    }

    handleProductChange = (e) => {
        const selectedProduct = this.state.order.products.find(
            product => product.productID._id === e.target.value
        )

        this.setState({
            selectedProduct,
            refundAmount: selectedProduct ? selectedProduct.price * this.state.quantity : 0
        })
    }

    handleQuantityChange = (e) => {
        const quantity = Number(e.target.value)
        this.setState(prevState => ({
            quantity,
            refundAmount: prevState.selectedProduct ? prevState.selectedProduct.price * quantity : 0
        }))
    }

    handleReasonChange = (e) => {
        this.setState({ reason: e.target.value })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const { selectedProduct, quantity, reason, refundAmount, userId } = this.state
        const orderId = this.state.order ? this.state.order._id : null

        if (!selectedProduct || quantity <= 0 || !reason || refundAmount <= 0) {
            this.setState({ error: "Please fill all the fields correctly." })
            return
        }

        axios.post(`${SERVER_HOST}/returns`, {
            orderId,
            userId,
            productId: selectedProduct.productID._id,
            quantity,
            reason,
            refundAmount
        })
            .then(res => {
                if (res.data.errorMessage) {
                    this.setState({ error: res.data.errorMessage })
                } else {
                    this.setState({ showModal:true })
                }
            })
            .catch(() => this.setState({ error: "Error submitting the return request" }))
    }

    handleCloseModal = () => {
        this.setState({ showModal: false, redirectToUserProfile: true });
    }

    render() {
        const { order, selectedProduct, quantity, reason, refundAmount, error, redirectToUserProfile, userId } = this.state

        if (!order) {
            return <p>Loading order details...</p>
        }

        return (
            <div className="return-form-container">
                {redirectToUserProfile ? <Redirect to={`/UserProfile/${userId}/returns`} /> : null}
                <h2>Return Form</h2>
                {error && <p className="error">{error}</p>}

                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label>Order ID</label>
                        <input type="text" value={order._id} disabled />
                    </div>

                    {order?.products?.length > 0 ? (
                        <div className="select-wrapper">
                            <label>Product to Return</label>
                            <select onChange={this.handleProductChange}>
                                <option value="">Select a product</option>
                                {order.products.map(product =>
                                    product.productID ? (
                                        <option key={product._id} value={product.productID._id}>
                                            {product.productID.name} - €{product.price.toFixed(2)}
                                        </option>
                                    ) : (
                                        <option key={product._id} disabled>
                                            Unknown Product - €{product.price.toFixed(2)}
                                        </option>
                                    )
                                )}
                            </select>
                            <CiCircleChevDown className="select-icon" />
                        </div>
                    ) : (
                        <p>No products available for return.</p>
                    )}


                    {selectedProduct && (
                        <>
                            <div>
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={this.handleQuantityChange}
                                    max={selectedProduct ? selectedProduct.quantity : ""}
                                />
                            </div>

                            <div>
                                <label>Refund Amount</label>
                                <input type="text" value={`€${refundAmount.toFixed(2)}`} disabled />
                            </div>
                        </>
                    )}

                    <div>
                        <label>Reason for Return</label>
                        <textarea value={reason} onChange={this.handleReasonChange} required />
                    </div>

                    <div>
                        <button type="submit">Submit Return Request</button>
                    </div>
                </form>
                {this.state.showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h4>Return Request Submitted Successfully</h4>
                            <p>Please allow 3-5 working days for review.</p>
                            <button className="orange-button" onClick={this.handleCloseModal}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

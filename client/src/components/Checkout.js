import React, { Component } from 'react'
import axios from 'axios'
import { ACCESS_LEVEL_GUEST, SERVER_HOST } from "../config/global_constants"

export default class Checkout extends Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            deliveryAddress: {
                address: '',
                city: '',
                postcode: '',
                phone: ''
            },
            userHasAddress: false,
            orderComplete: false,
            total: 0,
            error: ''
        }
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handleAddressChange = (e) => {
        const { name, value } = e.target
        this.setState(prevState => ({
            deliveryAddress: {
                ...prevState.deliveryAddress,
                [name]: value
            }
        }))
    }

    calculateTotal() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems'))
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0) + 5
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const cartItems = JSON.parse(localStorage.getItem('cartItems'))

        const products = cartItems.map(item => ({
            productID: item._id,
            quantity: item.quantity,
            price: item.price
        }))

        const total = this.calculateTotal()

        let order = {
            userId: localStorage.getItem('userId'),
            userEmail: localStorage.userId ? localStorage.email : this.state.email,
            deliveryAddress: this.state.deliveryAddress,
            products: products,
            total: total
        }

        axios.post(`${SERVER_HOST}/orders`, order, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data && res.data._id) {
                    // clear cart
                    this.props.clearCart()

                    this.setState({
                        orderComplete: true,
                        orderID: res.data._id
                    })
                } else if (res.data && res.data.errorMessage) {
                    this.setState({
                        error: res.data.errorMessage
                    })
                }
            })
            .catch(err => {
                console.error(err)
                this.setState({
                    error: 'Error submitting order: ' + err.message
                })
            })
    }

    render() {
        const { orderComplete, orderID, error } = this.state

        if (orderComplete) {
            return (
                <div className="checkout-success">
                    <h2>Thank You For Your Order!</h2>
                    <p>Your order has been placed successfully.</p>
                    <p>Order ID: {orderID}</p>
                    <button
                        className="blue-button"
                        onClick={() => window.location.href = '/DisplayAllProducts'}>
                        Continue Shopping
                    </button>
                </div>
            )
        }

        const total = this.calculateTotal()

        return (
            <div className='checkout-container'>
                <h2>Checkout</h2>
                {error && <p className="error">{error}</p>}

                <form onSubmit={this.handleSubmit}>
                    {!this.state.userHasAddress || localStorage.accessLevel === ACCESS_LEVEL_GUEST ? (
                        <>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
                            <h3>Delivery Address</h3>
                            <div className="form-group">
                                <label>Street Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={this.state.deliveryAddress.address}
                                    onChange={this.handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={this.state.deliveryAddress.city}
                                    onChange={this.handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Postcode</label>
                                <input
                                    type="text"
                                    name="postcode"
                                    value={this.state.deliveryAddress.postcode}
                                    onChange={this.handleAddressChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={this.state.deliveryAddress.phone}
                                    onChange={this.handleAddressChange}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>

                            <div className="order-summary">
                                <h3>Order Summary</h3>
                                <p>Total: €{total.toFixed(2)}</p>
                            </div>

                            <button type="submit" className="green-button">
                                Place Order
                            </button>
                        </>
                    )}
                </form>
            </div>
        )
    }
}
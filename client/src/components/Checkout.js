import React, { Component } from 'react'
import axios from 'axios'
import { SANDBOX_CLIENT_ID, SERVER_HOST } from "../config/global_constants"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"

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
            isLoggedIn: Boolean(localStorage.token && localStorage.token !== "null"),
            userHasAddress: false,
            orderComplete: false,
            proceedPayment: false,
            total: 0,
            error: ''
        }
    }

    componentDidMount() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || []
        if (!cartItems.length) {
            window.location.href = '/Cart'
            return
        }

        const isLoggedIn = Boolean(localStorage.token && localStorage.token !== "null" && localStorage.userId)
        if (isLoggedIn) {
            axios.get(`${SERVER_HOST}/users/${localStorage.userId}`, {
                headers: { authorization: localStorage.token }
            })
                .then(res => {
                    if (res.data?.deliveryAddress?.address) {
                        this.setState({
                            userHasAddress: true,
                            deliveryAddress: res.data.deliveryAddress
                        })
                    }
                })
                .catch(err => console.error("Error fetching user data:", err))
        }

        this.setState({ total: this.calculateTotal(cartItems) })
    }

    calculateTotal(cartItems) {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        return subtotal > 0 ? subtotal + 5 : 0
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    handleAddressChange = (e) => {
        const { name, value } = e.target
        this.setState(prevState => ({
            deliveryAddress: { ...prevState.deliveryAddress, [name]: value }
        }))
    }

    validateForm = () => {
        const { email, deliveryAddress, name, isLoggedIn } = this.state
        if (!isLoggedIn && !name) {
            this.setState({ error: "Please enter your name." })
            return false
        }

        if (!isLoggedIn && !email) {
            this.setState({ error: "Please enter your email address." })
            return false
        }

        if (!Object.values(deliveryAddress).every(field => field.trim())) {
            this.setState({ error: "Please complete all delivery address fields." })
            return false
        }

        return true
    }

    handleProceedToPayment = (e) => {
        e.preventDefault()
        if (this.validateForm()) {
            this.setState({ proceedPayment: true, error: '' })
        }
    }

    createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [{
                description: "Your order from Our Store",
                amount: {
                    currency_code: "EUR",
                    value: this.state.total.toFixed(2)
                }
            }]
        }).then(orderID => {
            console.log("Order Created:", orderID)
            return orderID
        }).catch(error => {
            console.error("Error Creating Order:", error)
        })
    }

    onApprove = (data, actions) => {
        console.log("Payment Approved:", data)

        return actions.order.capture()
            .then(details => {
                console.log("Payment Captured:", details)

                const cartItems = JSON.parse(localStorage.getItem('cartItems')) || []

                const products = cartItems.map(item => ({
                    productID: item._id,
                    quantity: item.quantity,
                    price: item.price
                }))

                const order = {
                    userId: localStorage.userId || null,
                    email: localStorage.userId ? localStorage.email : this.state.email,
                    name: localStorage.userId ? localStorage.name : this.state.name,
                    deliveryAddress: this.state.deliveryAddress,
                    products,
                    total: this.state.total,
                    paypalPaymentID: data.orderID
                }

                console.log("Sending Order to Backend:", order)

                // Check if the user is logged in and doesn't have an address saved
                if (this.state.isLoggedIn && !this.state.userHasAddress) {
                    axios.post(`${SERVER_HOST}/users/update/${localStorage.email}`, {
                        address: this.state.deliveryAddress.address,
                        city: this.state.deliveryAddress.city,
                        postcode: this.state.deliveryAddress.postcode,
                        phoneNumber: this.state.deliveryAddress.phone
                    }, { headers: { authorization: localStorage.token } })
                        .then(res => {
                            console.log("Address saved:", res.data)
                            // After saving address, send the order
                            this.sendOrderToBackend(order)
                        })
                        .catch(err => {
                            console.error("Error saving address:", err)
                            this.setState({ error: 'Error saving address. Please try again.' })
                        })
                } else {
                    // Directly send the order if no address update needed
                    this.sendOrderToBackend(order)
                }
            })
            .catch(error => {
                console.error("Error Capturing Payment:", error)
                this.setState({ error: "Error capturing payment. Please try again." })
            })
    }

    sendOrderToBackend = (order) => {
        axios.post(`${SERVER_HOST}/orders`, order, { headers: { authorization: localStorage.token } })
            .then(res => {
                console.log("Order Response:", res.data)
                if (res.data?._id) {
                    this.props.clearCart()
                    this.setState({ orderComplete: true, orderID: res.data._id })
                } else {
                    this.setState({ error: res.data?.errorMessage || "Error processing order" })
                }
            })
            .catch(err => {
                console.error("Error submitting order:", err)
                this.setState({ error: 'Error submitting order: ' + err.message })
            })
    }

    onError = (err) => this.setState({ error: "Payment error. Please try again." })

    onCancel = () => this.setState({ error: "Payment was cancelled." })

    render() {
        const { orderComplete, orderID, error, userHasAddress, isLoggedIn, total, proceedPayment } = this.state
        const isGuest = !isLoggedIn
        const needsAddress = !userHasAddress || isGuest

        if (orderComplete) {
            return (
                <div className="checkout-success">
                    <div className="fa-check-wrapper">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <h2>Thank You For Your Order!</h2>
                    <p>Your order has been placed successfully.</p>
                    {isLoggedIn && needsAddress ? (
                        <p>Delivery address has been saved to user profile.</p>
                    ) : null}
                    <p>Order ID: {orderID}</p>
                    <button
                        className="continue-shopping"
                        onClick={() => window.location.href = '/DisplayAllProducts'}>
                        Continue Shopping
                    </button>
                </div>
            )
        }

        return (
            <div className='checkout-container'>
                <h2>Checkout</h2>
                {error && <p className="error">{error}</p>}

                <form>
                    {isGuest && (
                        <>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    required
                                />
                            </div>
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
                        </>
                    )}
                    {needsAddress && (
                        <>
                            {["address", "city", "postcode", "phone"].map(field => (
                                <div className="form-group" key={field}>
                                    <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                    <input
                                        type="text"
                                        name={field}
                                        value={this.state.deliveryAddress[field]}
                                        onChange={this.handleAddressChange}
                                        required
                                    />
                                </div>
                            ))}
                            <button type="button" className="continue-button" onClick={this.handleProceedToPayment}>
                                Continue to Payment
                            </button>
                        </>
                    )}

                    <div className={`paypal-container ${!proceedPayment ? 'disabled' : ''}`}>
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <p>Total: €{total.toFixed(2)}</p>
                        </div>
                        {!proceedPayment && <p className="payment-message">Please complete the form above to proceed</p>}
                        {(proceedPayment || (isLoggedIn && userHasAddress)) && (
                            <PayPalScriptProvider options={{
                                currency: "EUR",
                                "client-id": SANDBOX_CLIENT_ID,
                                components: "buttons"
                            }}>
                                <PayPalButtons
                                    style={{ layout: "horizontal", tagline: false, shape: "pill", label: "pay" }}
                                    createOrder={this.createOrder}
                                    onApprove={this.onApprove}
                                    onError={this.onError}
                                    onCancel={this.onCancel}
                                />
                            </PayPalScriptProvider>
                        )}
                    </div>
                </form>
            </div>
        )
    }
}

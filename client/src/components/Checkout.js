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
                .catch(err => {
                    console.error("Error fetching user data:", err)
                })
        } else {
            console.log("User is a guest, skipping address fetch")
        }
    }

    validateCartStock = () => {
        // Get the latest cart items
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const stockIssues = [];

        // Check each item's stock against the database
        const stockCheckPromises = cartItems.map(item => {
            return axios.get(`${SERVER_HOST}/products/${item._id}`)
                .then(res => {
                    if (res.data && res.data.stock < item.quantity) {
                        stockIssues.push({
                            id: item._id,
                            name: item.name,
                            requestedQty: item.quantity,
                            availableQty: res.data.stock
                        });
                    }
                    return res.data;
                })
                .catch(err => {
                    console.error("Error checking stock for product:", err);
                    return null;
                });
        });

        return Promise.all(stockCheckPromises)
            .then(() => {
                return stockIssues;
            });
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

    calculateTotal() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || []
        if (!cartItems.length) {
            return 0
        }

        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        const shippingCost = subtotal > 0 ? 5 : 0;

        return subtotal + shippingCost
    }

    handleProceedToPayment = (e) => {
        e.preventDefault();

        // First validate the form
        if (this.validateForm()) {
            // Then validate stock levels
            this.validateCartStock()
                .then(stockIssues => {
                    if (stockIssues.length > 0) {
                        // There are stock issues
                        const message = stockIssues.map(issue =>
                            `${issue.name}: Only ${issue.availableQty} available (you requested ${issue.requestedQty})`
                        ).join('\n');

                        alert(`Some items in your cart are no longer available in the requested quantity:\n\n${message}\n\nPlease update your cart before proceeding.`);

                        // Redirect back to cart
                        window.location.href = '/Cart';
                    } else {
                        // Stock is okay, proceed to payment
                        this.setState({
                            proceedPayment: true,
                            error: ''
                        });
                    }
                });
        }
    }

    validateForm = () => {
        const { email, deliveryAddress } = this.state
        const isLoggedIn = localStorage.token && localStorage.token !== "null"

        // Check email for guest users
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
            })
            .catch(error => {
                console.error("Error Capturing Payment:", error)
                this.setState({ error: "Error capturing payment. Please try again." })
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

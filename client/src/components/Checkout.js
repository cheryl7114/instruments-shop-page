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
            isLoggedIn: localStorage.token && localStorage.token !== "null",
            userHasAddress: false,
            orderComplete: false,
            proceedPayment: false,
            total: 0,
            error: ''
        }
    }

    componentDidMount() {
        // First validate if there are items in cart
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || []
        if (!cartItems.length) {
            // Redirect to cart page if no items
            window.location.href = '/Cart'
            return
        }
        // First check if the user is logged in
        // since guest users don't have a local storage token
        const isLoggedIn = localStorage.token &&
            localStorage.token !== "null" &&
            localStorage.userId &&
            localStorage.userId !== "null"
        console.log("ComponentDidMount - Login status:", isLoggedIn)
        // Only fetch user details if logged in
        if (isLoggedIn) {
            // Use localStorage.userId instead of this.props.match.params.id
            axios.get(`${SERVER_HOST}/users/${localStorage.userId}`, {
                headers: { "authorization": localStorage.token }
            })
                .then(res => {
                    console.log("User data fetched:", res.data)
                    if (res.data && res.data.deliveryAddress && res.data.deliveryAddress.address) {
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
            this.setState({ error: "Please enter your email address." });
            return false
        }

        // Check delivery address
        if (!deliveryAddress.address || !deliveryAddress.city ||
            !deliveryAddress.postcode || !deliveryAddress.phone) {
            this.setState({ error: "Please complete all delivery address fields." })
            return false
        }

        return true
    }

    proceedPayment = () => {
        this.setState({
            proceedPayment: true
        })
    }

    createOrder = (data, actions) => {
        const total = this.calculateTotal()

        return actions.order.create({
            purchase_units: [{
                description: "Your order from Our Store",
                amount: {
                    currency_code: "EUR",
                    value: total.toFixed(2)
                }
            }]
        })
    }

    onApprove = (data, actions) => {
        return actions.order.capture().then(details => {
            console.log("Order approved:", details)

            const cartItems = JSON.parse(localStorage.getItem('cartItems'))

            const products = cartItems.map(item => ({
                productID: item._id,
                quantity: item.quantity,
                price: item.price
            }))

            const total = this.calculateTotal()

            // create order object
            const order = {
                userId: localStorage.getItem('userId'),
                email: localStorage.userId ? localStorage.email : this.state.email,
                deliveryAddress: this.state.deliveryAddress,
                products: products,
                total: total,
                paypalPaymentID: data.orderID
            }

            axios.post(`${SERVER_HOST}/orders`, order, { headers: { "authorization": localStorage.token } })
                .then(res => {
                    if (res.data && res.data._id) {
                        // clear cart after successful order
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
        })
    }

    onError = (err) => {
        console.error("PayPal error:", err);
        this.setState({
            error: "There was a problem processing your payment. Please try again."
        })
    }

    onCancel = () => {
        console.log("Payment cancelled by user");
        this.setState({
            error: "Payment was cancelled. You can try again when you're ready."
        })
    }

    render() {
        const { orderComplete, orderID, error, userHasAddress, isLoggedIn } = this.state
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

        const total = this.calculateTotal()

        return (
            <div className='checkout-container'>
                <h2>Checkout</h2>
                {error && <p className="error">{error}</p>}

                <form>
                    {isGuest && (
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
                        </>
                    )}
                    {needsAddress && (
                        <>
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
                            <button
                                type="button"
                                className="continue-button"
                                onClick={this.handleProceedToPayment}>
                                Continue to Payment
                            </button>
                        </>
                    )}
                    <div className={`paypal-container ${!this.state.proceedPayment ? 'disabled' : ''}`}>
                        <div className="order-summary">
                            <h3>Order Summary</h3>
                            <p>Total: €{total.toFixed(2)}</p>
                        </div>
                        {!this.state.proceedPayment && (
                            <div className="payment-message">
                                <p>Please complete the form above and click "Continue to Payment" to proceed</p>
                            </div>
                        )}
                        {(this.state.proceedPayment || (isLoggedIn && userHasAddress)) && (
                            <PayPalScriptProvider options={{
                                currency: "EUR",
                                "client-id": SANDBOX_CLIENT_ID,
                                components: "buttons,funding-eligibility"
                            }}>
                                <PayPalButtons
                                    style={{ layout: "horizontal", tagline: false, shape: "pill", label: "pay" }}
                                    fundingSource={undefined}
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
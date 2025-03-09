import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import CartItem from './CartItem'

export default class Cart extends Component {
    constructor(props) {
        super(props)

        this.state = {
            stockWarnings: [] // To track any stock availability warnings
        }
    }

    componentDidMount() {
        this.validateCartStockLevels()
    }

    componentDidUpdate(prevProps) {
        // If cart items change, revalidate stock levels
        if (prevProps.cartItems !== this.props.cartItems) {
            this.validateCartStockLevels()
        }
    }

    // Add this method to validate stock levels
    validateCartStockLevels() {
        const { cartItems } = this.props

        const warnings = cartItems
            .filter(item => item.quantity > item.stock)
            .map(item => ({
                id: item._id,
                name: item.name,
                requestedQty: item.quantity,
                availableQty: item.stock
            }))

        // If there are any items with quantity > stock
        if (warnings.length > 0) {
            this.setState({ stockWarnings: warnings })

            // Auto-adjust quantities to match available stock
            warnings.forEach(warning => {
                this.props.updateQuantity(warning.id, warning.availableQty)
            })
        } else {
            this.setState({ stockWarnings: [] })
        }
    }

    calculateCartSubtotal() {
        const { cartItems } = this.props
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    calculateShippingCost() {
        const { cartItems } = this.props
        return cartItems.length > 0 ? 5 : 0
    }

    calculateCartTotal() {
        return this.calculateCartSubtotal() + this.calculateShippingCost()
    }

    render() {
        const { cartItems, removeFromCart, updateQuantity } = this.props
        const { stockWarnings } = this.state

        // Calculate cart totals using the class methods
        const cartSubtotal = this.calculateCartSubtotal()
        const shippingCost = this.calculateShippingCost()
        const cartTotal = this.calculateCartTotal()

        return (
            <div>
                {stockWarnings.length > 0 && (
                    <div className="stock-warnings">
                        <h4>Stock Availability Notice:</h4>
                        <ul>
                            {stockWarnings.map(warning => (
                                <li key={warning.id}>
                                    Only {warning.availableQty} {warning.name}(s) available (you requested {warning.requestedQty})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty</p>
                        <Link to="/DisplayAllProducts" className="continue-shopping">Continue Shopping</Link>
                    </div>
                ) : (
                    <div className="cart-container">
                        <div className="cart-content">
                            <div className="cart-items">
                                {cartItems.map(item => (
                                    <CartItem
                                        key={item._id}
                                        item={item}
                                        removeFromCart={removeFromCart}
                                        updateQuantity={updateQuantity}
                                    />
                                ))}
                            </div>

                            <div className="cart-summary">
                                <h3>Order Summary</h3>
                                <div className="subtotal">
                                    <span>Subtotal</span>
                                    <span>€{cartSubtotal.toFixed(2)}</span>
                                </div>
                                <div className="shipping">
                                    <span>Shipping</span>
                                    <span>€{shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="total">
                                    <span>Total</span>
                                    <span>€{cartTotal.toFixed(2)}</span>
                                </div>

                                <div className="cart-actions">
                                    <Link to="/Checkout" className="checkout-button">Proceed to Checkout</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>)
    }
}
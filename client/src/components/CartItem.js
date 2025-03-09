import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { SERVER_HOST } from '../config/global_constants'
import { RiDeleteBin5Line } from "react-icons/ri"

export default class CartItem extends Component {
    constructor(props) {
        super(props)

        this.state = {
            imageSrc: null,
            showModal: false,
            modalMessage:""
        }
    }

    componentDidMount() {
        this.loadItemImage()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.item !== this.props.item ||
            (prevProps.item?.images?.[0] !== this.props.item?.images?.[0])) {
            this.loadItemImage();
        }
    }

    loadItemImage() {
        const { item } = this.props

        // Load the first image for this product if available
        if (item.images && item.images.length > 0) {
            axios.get(`${SERVER_HOST}/products/image/${item.images[0].filename}`)
                .then(res => {
                    if (res.data && res.data.image) {
                        this.setState({
                            imageSrc: `data:image/jpeg;base64,${res.data.image}`
                        })
                    }
                })
                .catch(err => console.error("Error loading image:", err))
        }
    }

    handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value)
        if (!isNaN(newQuantity) && newQuantity > 0) {
            this.props.updateQuantity(this.props.item._id, newQuantity)
        }
    }

    handleRemoveFromCart = () => {
        this.props.removeFromCart(this.props.item._id)
    }

    incrementQuantity = () => {
        const { item, updateQuantity } = this.props;

        console.log("Item stock:", item.stock, "Current quantity:", item.quantity);

        if (item.quantity < item.stock) {
            updateQuantity(item._id, item.quantity + 1);
        } else {
            console.log("Stock limit reached, but no modal will be shown here.");
        }
    };

    decrementQuantity = () => {
        const { item, updateQuantity } = this.props
        if (item.quantity > 1) {
            updateQuantity(item._id, item.quantity - 1)
        }
    }

    handleCloseModal = () => {
        this.setState({showModal: false, modalMessage: ""})
    }

    render() {
        const { item, removeFromCart } = this.props
        const { imageSrc } = this.state

        return (
            <div className="cart-item-container">
                <div className="item-image">
                    {imageSrc ? (
                        <img src={imageSrc} alt={item.name} />
                    ) : (
                        <div className="no-image">No Image</div>
                    )}
                </div>

                <div className="item-details">
                    <Link to={`/ProductDetails/${item._id}`}>
                        <h3>{item.name}</h3>
                    </Link>
                    {item.brand && <p>{item.brand}</p>}
                    {item.category && <p>{item.category}</p>}
                </div>

                <div className="item-actions">
                    <p className="item-total">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="bottom-item-container">
                    <div className="quantity-control">
                        <button
                            className="quantity-btn"
                            onClick={this.decrementQuantity}
                            disabled={item.quantity <= 1}
                        >
                            -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                            className="quantity-btn"
                            onClick={this.incrementQuantity}
                            disabled={item.quantity >= item.stock}
                        >
                            +
                        </button>
                    </div>
                    <RiDeleteBin5Line
                        className="remove-item-icon"
                        onClick={() => removeFromCart(item._id)}
                    />
                </div>
                <div className="underline"></div>
                {this.state.showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <p>{this.state.modalMessage}</p>
                            <button className="modal-close-btn" onClick={this.handleCloseModal}>OK</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}
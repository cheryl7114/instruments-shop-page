import React, { Component } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { FaShoppingCart } from "react-icons/fa"
import { CiEdit, CiTrash } from "react-icons/ci"
import { ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST } from "../config/global_constants"

export default class ProductDetails extends Component {
    constructor(props) {
        super(props)

        this.state = {
            product: {},
            mainImage: "",
            redirectToDisplayAllProducts: localStorage.accessLevel < ACCESS_LEVEL_GUEST
        }
    }

    handleImageClick = (img) => {
        this.setState({ mainImage: img })

        axios.get(`${SERVER_HOST}/products/image/${img.filename}`)
            .then(res => {
                if (res.data.image) {
                    document.getElementById("mainImage").src = `data:image/png;base64,${res.data.image}`
                }
            })
    }

    handleAddToCart = () => {
        const { product } = this.state

        // Check if product is out of stock
        if (product.stock <= 0) {
            alert("Sorry, this product is out of stock")
            return
        }

        // Call addToCart and get success status back
        const success = this.props.addToCart(product)

        // Only show success message if adding to cart was successful
        if (success) {
            alert(`${product.name} added to cart!`)
        }
        // No need for an else statement since addToCart should show its own error message
    }

    componentDidMount() {
        axios.get(`${SERVER_HOST}/products/${this.props.match.params.id}`, { headers: { "authorization": localStorage.token } })
            .then(res => {
                if (res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    } else {
                        this.setState({
                            product: res.data,
                            mainImage: res.data.images.length > 0 ? res.data.images[0] : ""
                        }, () => {
                            if (this.state.product.images && this.state.product.images.length > 0) {
                                axios.get(`${SERVER_HOST}/products/image/${this.state.product.images[0].filename}`)
                                    .then(res => {
                                        if (res.data.image) {
                                            document.getElementById("mainImage").src = `data:image/png;base64,${res.data.image}`
                                        }
                                    })
                                // .catch(err => console.error(`Error loading image ${image.filename}`, err))
                                const imagePromises = this.state.product.images.map(image =>
                                    axios.get(`${SERVER_HOST}/products/image/${image.filename}`)
                                        .then(res => {
                                            if (res.data.image) {
                                                document.getElementById(image._id).src = `data:image/png;base64,${res.data.image}`
                                            }
                                        })
                                        .catch(err => console.error(`Error loading image ${image.filename}`, err))
                                )

                                Promise.all(imagePromises).then(() => {
                                    console.log("All images loaded successfully")
                                })
                            }
                        })
                    }
                }
            })
            .catch(err => console.error("Error fetching product:", err))
    }


    render() {
        const { product } = this.state

        return (
            <div className="body-container">
                <div className="product-details-container">
                    <div className="product-details">
                        <div className="product-image">
                            {this.state.mainImage ? (
                                <img
                                    id="mainImage"
                                    alt={product.name}
                                    className="main-image" />
                            ) : (
                                <p>No images available</p>
                            )}

                            <div className="thumbnail-container">
                                {product.images && product.images.map(image => (
                                    <img
                                        key={image._id}
                                        id={image._id}
                                        alt={product.name}
                                        className="thumbnail-image"
                                        onClick={() => this.handleImageClick(image)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="product-info">
                            <h2>{product.name}</h2>
                            <p className="details">{product.category}</p>
                            <p className="details"><strong>Colour:</strong> {product.colour}</p>
                            <p className="details"><i>{product.stock} units left</i></p>
                            <h3><span id="price-text"><b> </b></span>€{product.price}</h3>

                            {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                                <Link className="edit-button" to={"/EditProduct/" + product._id}>
                                    <CiEdit size={25} />
                                </Link>
                                :
                                null}
                            {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                                <Link className="delete-button" to={"/DeleteProduct/" + product._id}>
                                    <CiTrash size={25} />
                                </Link>
                                :
                                null
                            }
                            <button
                                className="add-to-cart-button"
                                onClick={this.handleAddToCart}
                            >
                                {product.stock <= 0 ? 'Out of Stock' : (
                                    <>
                                        Add to Cart <FaShoppingCart className="add-cart-icon" />
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
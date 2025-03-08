import React, {Component} from "react"
import {Link} from "react-router-dom"
import { CiEdit, CiTrash } from "react-icons/ci"


import {ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST} from "../config/global_constants"
import axios from "axios";

export default class ProductCard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imageSrc: null
        }
    }

    componentDidMount() {
        if (this.props.product.images.length > 0) {
            const image = this.props.product.images[0] // Get the first image

            axios.get(`${SERVER_HOST}/products/image/${image.filename}`)
                .then(res => {
                    if (res.data && res.data.image) {
                        this.setState({ imageSrc: `data:image/jpeg;base64,${res.data.image}` })
                    } else {
                        console.log(res.data.errorMessage || "Record not found")
                    }
                })
                .catch(err => console.log("Error loading image:", err))
        }
    }

    render() {
        return (
            <div className="product-card">
                <Link to={"/ProductDetails/" + this.props.product._id}>
                    <img
                        src={this.state.imageSrc}
                        alt={this.props.product.name}
                        width="150"
                        height="120"
                    />

                </Link>
                <h4>{this.props.product.name}</h4>
                <p>€{this.props.product.price}</p>
                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                    <Link className="edit-button" to={"/EditProduct/" + this.props.product._id}>
                        <CiEdit size={25} />
                    </Link>
                    :
                null}
                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                    <Link className="delete-button" to={"/DeleteProduct/" + this.props.product._id}>
                        <CiTrash size={25} />
                    </Link>
                    :
                 null
                }
            </div>
        )
    }
}
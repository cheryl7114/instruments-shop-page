import React, {Component} from "react"
import {Link} from "react-router-dom"

import {ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN} from "../config/global_constants"

export default class ProductTableRow extends Component {
    render() {
        return (
            <div className="product-card">
                <Link to={"/ProductDetails/" + this.props.product._id}>
                    <img
                        src={this.props.product.images[0]}
                        alt={this.props.product.name}
                        width="150"
                        height="120"
                    />
                </Link>
                <h4>{this.props.product.name}</h4>
                <p>€{this.props.product.price}</p>
                {localStorage.accessLevel > ACCESS_LEVEL_GUEST ? <Link className="green-button" to={"/EditProduct/" + this.props.product._id}>Edit</Link> : null}
                {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ? <Link className="red-button" to={"/DeleteProduct/" + this.props.product._id}>Delete</Link> : null}
            </div>
        )
    }
}
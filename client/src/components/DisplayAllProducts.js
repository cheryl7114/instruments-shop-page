import React, {Component} from "react"
import {Link} from "react-router-dom"

import axios from "axios"

import ProductTable from "./ProductTable"
import Logout from "./Logout"

import {ACCESS_LEVEL_GUEST, ACCESS_LEVEL_ADMIN, SERVER_HOST} from "../config/global_constants"


export default class DisplayAllProducts extends Component {
    constructor(props) {
        super(props)

        this.state = {
            products:[]
        }
    }


    componentDidMount() {
        axios.get(`${SERVER_HOST}/products`)
            .then(res => {
                if(res.data) {
                    if (res.data.errorMessage) {
                        console.log(res.data.errorMessage)
                    }
                    else {
                        console.log("Records read")
                        this.setState({products: res.data})
                    }
                }
                else {
                    console.log("Record not found")
                }
            })
    }


    render()
    {
        return (
            <div className="form-container">
                {localStorage.accessLevel > ACCESS_LEVEL_GUEST ?
                    <div className="logout">
                        <Logout/>
                    </div>
                    :
                    <div>
                        <Link className="green-button" to={"/Login"}>Login</Link>
                        <Link className="blue-button" to={"/Register"}>Register</Link>
                        <Link className="red-button" to={"/ResetDatabase"}>Reset Database</Link>  <br/><br/><br/></div>
                }

                <div className="table-container">
                    <ProductTable products={this.state.products} />

                    {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                        <div className="add-new-product">
                            <Link className="blue-button" to={"/AddProduct"}>Add New Product</Link>
                        </div>
                        :
                        null
                    }
                </div>
            </div>
        )
    }
}
import React, {Component} from "react"
import {Link} from "react-router-dom"
import { CiCirclePlus } from "react-icons/ci"

import axios from "axios"

import ProductGrid from "./ProductGrid"
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
            <div className="body-container">
                {localStorage.accessLevel > ACCESS_LEVEL_GUEST ?
                    <div className="logout">
                        <Logout/>
                    </div>
                    :
                    <div>

                        <Link className="green-button" to={"/Login"}>
                            <svg id="profile" viewBox="0 0 20 24" width="20" height="20">
                                <title>Login or Signup</title>
                                <g fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="2">
                                    <path d="M19 20.5 15.63 16H4.38L1 20.5"></path>
                                    <circle cx="10" cy="8.5" r="4.5"></circle>
                                </g>
                            </svg>
                        </Link>
                        <Link className="red-button" to={"/ResetDatabase"}>Reset Database</Link>  <br/><br/><br/></div>
                }


                    {localStorage.accessLevel >= ACCESS_LEVEL_ADMIN ?
                        <div className="add-new-product">
                            <Link to={"/AddProduct"}>
                                <CiCirclePlus size={30} />
                            </Link>
                        </div>
                    : null}

                    <div className="product-grid">
                        <ProductGrid products={this.state.products} />
                    </div>


            </div>
        )
    }
}
import React, {Component} from "react"
import {BrowserRouter, Switch, Route} from "react-router-dom"

import "bootstrap/dist/css/bootstrap.css"
import "./css/App.css"

import AddCar from "./components/AddCar"
import EditCar from "./components/EditCar"
import DeleteCar from "./components/DeleteCar"
import DisplayAllCars from "./components/DisplayAllCars"
import UserRegistration from "./components/UserRegistration"
import ResetDatabase from "./components/ResetDatabase"

    
export default class App extends Component 
{
    render() 
    {
        return (
            <BrowserRouter>
                <Switch>                 
                    <Route exact path="/" component={DisplayAllCars} />
                    <Route exact path="/AddCar" component={AddCar} />
                    <Route exact path="/EditCar/:id" component={EditCar} />
                    <Route exact path="/DeleteCar/:id" component={DeleteCar} />
                    <Route exact path="/DisplayAllCars" component={DisplayAllCars}/> 
                    <Route exact path="/UserRegistration" component={UserRegistration} />
                    <Route exact path="/ResetDatabase" component={ResetDatabase} />   
                    <Route path="*" component={DisplayAllCars}/>                       
                </Switch>
            </BrowserRouter>
        )
    }
}
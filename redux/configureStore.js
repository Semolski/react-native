import {createStore, combineReducers, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import logger from 'redux-logger';
import {DISHES} from "../shared/dishes";
import {COMMENTS} from "../shared/comments";
import {LEADERS} from "../shared/leaders";
import {PROMOTIONS} from "../shared/promotions";

export const ConfigureStore = () => {
    const store = createStore(
        combineReducers({
            dishes,
            comments,
            leaders,
            promotions
        }),
        applyMiddleware(thunk, logger)
    );
    return store;
}

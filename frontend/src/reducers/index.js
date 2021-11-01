import { combineReducers } from "redux";

import Prss from "./Prss";
import Cnvs from "./Cnvs";
import Errs from "./Errs";
import Msgs from "./Msgs";
import Likes from "./Likes";

const rootReducer = combineReducers({ Prss, Cnvs, Errs, Msgs, Likes });

export default rootReducer;

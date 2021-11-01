import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as actionCreators from "./actions/actionCreators";
import Main from "./components/Main/Main";

// State properties automatically passed to Main
function mapStateToProps(state) {
  return {
    Errs: state.Errs,
    Prss: state.Prss,
    Msgs: state.Msgs,
    Likes: state.Likes,
  };
}

// Function properties automatically passed to Main
function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}

const App = withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));

export default App;

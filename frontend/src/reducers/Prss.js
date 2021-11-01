function Prss(state = {}, action) {
  console.log("reducing action " + action.type);
  switch (action.type) {
    case "SIGN_IN":
      return action.user;
    case "SIGN_OUT":
      return {};
    default:
      return state;
  }
}

export default Prss;

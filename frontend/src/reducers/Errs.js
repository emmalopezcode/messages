function Errs(state = {}, action) {
  switch (action.type) {
    case "REGISTER_ERR":
      return action.details[0];
    case "CLEAR_ERRS":
      return {};
    case "SIGNIN_ERR":
      return action.details[0];
    case "CNV_TITLE_NOT_UNIQUE":
      return action.details[0];
    default:
      return state;
  }
}

export default Errs;

function Msgs(state = [], action) {
  switch (action.type) {
    case "UPDATE_MSGS":
      return action.msgs;
    case "SET_NUMLIKES":
      return state.map((msg) => {
        if (msg.id === action.msgId)
          return Object.assign({}, msg, { numLikes: action.likes.length });
        else return msg;
      });
    case "ADD_MSG":
      return state.concat(action.msg);

    default:
      return state;
  }
}

export default Msgs;

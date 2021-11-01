function Likes(state = {}, action) {
  switch (action.type) {
    case "UPDATE_LIKES":
      var newArr = state;
      newArr[action.msgId] = action.likes;
      return newArr;
    case "ADD_LIKE":
      return state.concat(action.like);

    default:
      return state;
  }
}

export default Likes;

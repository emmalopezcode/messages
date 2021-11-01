import * as api from "../api";

export function clearErrs() {
  return (dispatch, prevState) => {
    dispatch({ type: "CLEAR_ERRS" });
  };
}

export function signIn(credentials, cb) {
  return (dispatch, prevState) => {
    api
      .signIn(credentials)
      .then((userInfo) => dispatch({ type: "SIGN_IN", user: userInfo }))
      .then(() => {
        if (cb) cb();
      })
      .catch((error) => dispatch({ type: "SIGNIN_ERR", details: error }));
  };
}

export function signOut(cb) {
  return (dispatch, prevState) => {
    api
      .signOut()
      .then(() => dispatch({ type: "SIGN_OUT" }))
      .then(() => {
        if (cb) cb();
      });
  };
}

export function register(data, cb) {
  return (dispatch, prevState) => {
    api
      .register(data)
      .then(() => {
        if (cb) cb();
      })
      .catch((error) => dispatch({ type: "REGISTER_ERR", details: error }));
  };
}

export function updateCnvs(userId, cb) {
  return (dispatch, prevState) => {
    api
      .getCnvs(userId)
      .then((cnvs) => dispatch({ type: "UPDATE_CNVS", cnvs }))
      .then(() => {
        if (cb) cb();
      });
  };
}

export function addCnv(newCnv, cb) {
  return (dispatch, prevState) => {
    api
      .postCnv(newCnv)
      .then((cnvRsp) => dispatch({ type: "ADD_CNV", cnv: cnvRsp }))
      .then(() => {
        if (cb) cb();
      });
  };
}

export function modCnv(cnvId, title, cb) {
  return (dispatch, prevState) => {
    api
      .putCnv(cnvId, { title })
      .then((cnvs) => dispatch({ type: "UPDATE_CNV", cnvs }))
      .then(() => {
        if (cb) cb();
      })
      .catch((error) =>
        dispatch({ type: "CNV_TITLE_NOT_UNIQUE", details: error })
      );
  };
}

export function delCnv(cnvId, cb) {
  return (dispatch) => {
    api
      .delCnv(cnvId)
      .then(() => dispatch({ type: "DELETE_CNV", cnvId }))
      .then(() => {
        if (cb) cb();
      });
  };
}

export function updateLikes(msgId, cb) {
  return (dispatch) => {
    api
      .getLikes(msgId)
      .then((likes) => dispatch({ type: "UPDATE_LIKES", likes, msgId }))
      .then(() => {
        if (cb) cb();
      });
  };
}

export function addLike(msgId, cb) {
  return (dispatch) => {
    api
      .postLike(msgId)
      .then((likes) => dispatch({ type: "SET_NUMLIKES", likes, msgId }))
      .then(() => {
        if (cb) cb();
      });
  };
}

export function updateMsgs(cnvId, cb1, cb2) {
  return (dispatch) => {
    api
      .getMsgs(cnvId)
      .then((msgs) => dispatch({ type: "UPDATE_MSGS", msgs }))
      .then(() => {
        if (cb1) cb1();
      })
      .then(() => {
        if (cb2) cb2();
      });
  };
}

export function addMsg(newMsg, cb) {
  return (dispatch) => {
    api
      .postMsg(newMsg)
      .then((msg) => dispatch({ type: "ADD_MSG", msg }))
      .then(() => {
        if (cb) cb();
      });
  };
}

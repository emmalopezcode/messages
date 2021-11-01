import React, { useState, useEffect } from "react";
import { ListGroupItem, Col, Row, Button } from "react-bootstrap";
import MsgModal from "./MsgModal";
import "./CnvDetail.css";
import { Popup } from "reactjs-popup";

export default (props) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    props.updateMsgs(props.location.cnvInfo.id);
  }, []);

  let handleChange = (e) => {
    setMessage(e.target.value);
  };

  let post = () => {
    var id = props.location.cnvInfo.id;
    props.addMsg({ cnvId: id, content: message });
    setMessage("");
  };

  return (
    <>
      <h1 className="cnv-title">{props.location.cnvInfo.title}</h1>
      <section className="container-cnv-detail" color="#AAAAAA">
        {props.Msgs.map((msg) => (
          <MsgItem
            id={msg.id}
            key={msg.id}
            email={msg.email}
            isUsers={msg.prsId === props.Prss.id || msg.prsId === undefined}
            sentDate={msg.whenMade}
            content={msg.content}
            numLikes={msg.numLikes}
            getLikes={(cb) => {
              props.updateLikes(msg.id, cb);
            }}
            globalLikes={props.Likes}
            onLike={() => {
              props.addLike(msg.id);
            }}
          />
        ))}
        <input
          value={message}
          className="msg-input"
          onChange={(e) => handleChange(e)}
        ></input>
        <button className="post" onClick={post}>
          Post
        </button>
      </section>
    </>
  );
};

const MsgItem = function (props) {
  const [likes, setLikes] = useState([]);

  let since = (lastDate) => {
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = day * 30;
    const first = new Date(lastDate);
    const now = Date.now();
    const diff = Math.abs(first - now);

    if (diff < hour) return `${Math.floor(diff / minute)} minutes ago`;
    if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
    if (diff < month) return `${Math.floor(diff / day)} days ago`;
    return `${Math.floor(diff / month)} months ago`;
  };

  return (
    <>
      <section className="msg">
        <div
          className={
            props.isUsers ? "msg-user in-app" : "msg-other-prac in-app"
          }
        >
          {props.content}

          <div className="like-area">
            <span onClick={props.onLike} className="fa fa-thumbs-up like-btn" />
            <Popup
              className="popup"
              trigger={
                <span type="button" className="likes">
                  {props.numLikes}
                </span>
              }
              on={["hover"]}
              onOpen={() => {
                if (props.numLikes > 0)
                  props.getLikes(() => {
                    setLikes(props.globalLikes[props.id]);
                  });
              }}
              position="right center"
              closeOnDocumentClick
            >
              <ul className="like-set">
                {likes.map((like, index) => (
                  <LikeItem
                    key={index}
                    firstName={like.firstName}
                    lastName={like.lastName}
                  />
                ))}
              </ul>
            </Popup>
          </div>
        </div>
        <div style={{ background: "white" }}></div>
      </section>
      <p
        style={props.isUsers ? { textAlign: "right" } : {}}
        className="user-since"
      >
        {since(props.sentDate)}
      </p>
    </>
  );
};

const LikeItem = function (props) {
  return (
    <section className="like">
      {props.firstName} {props.lastName}
    </section>
  );
};

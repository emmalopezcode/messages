import React, { Component, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ListGroup, ListGroupItem, Col, Row, Button } from "react-bootstrap";
import MsgModal from "./MsgModal";
import { ConfDialog } from "../components";
import "./CnvDetail.css";
import { Popup } from "reactjs-popup";

export default class CnvDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNewMsg: false,
      msg: null,
      cnvId: props.location.cnvInfo.id,
      msgItems: [],
      test: 0,
    };
    this.props.updateMsgs(this.state.cnvId);
  }

  openNewMsg = () => {
    this.setState({ showNewMsg: true });
  };

  closeNewMsg = (result) => {
    var id = this.props.location.cnvInfo.id;

    if (result.status === "Ok")
      this.props.addMsg({ cnvId: id, content: result.msg });
    this.setState({ showNewMsg: false, msg: null });
  };

  render() {
    return (
      <section className="container" color="#AAAAAA">
        {this.props.Msgs.map((msg, index) => (
          <MsgItem
            id={msg.id}
            key={msg.id}
            email={msg.email}
            sentDate={msg.whenMade}
            content={msg.content}
            numLikes={msg.numLikes}
            getLikes={(cb) => {
              this.props.updateLikes(msg.id, cb);
            }}
            globalLikes={this.props.Likes}
            onLike={() => {
              this.props.addLike(msg.id, () => {
                this.setState({});
              });
            }}
          />
        ))}
        <Button
          className="button"
          variant="primary"
          onClick={() => this.openNewMsg()}
        >
          Add Message
        </Button>
        <MsgModal
          show={this.state.showNewMsg}
          title={"New Message"}
          cnv={this.state.msg}
          onDismiss={this.closeNewMsg}
        />
      </section>
    );
  }
}

const MsgItem = function (props) {
  const [show, setShow] = useState(false);
  const [likes, setLikes] = useState([]);

  return (
    <ListGroupItem>
      <Row>
        <Col
          sm={4}
          onClick={() => {
            setShow(!show);
          }}
        >
          {props.email}
        </Col>
        <Col sm={4}>
          {new Intl.DateTimeFormat("us", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(new Date(props.sentDate))}
        </Col>

        <div className="float-right">
          <Popup
            trigger={
              <button type="button" className="button">
                {props.numLikes}
              </button>
            }
            on={["hover"]}
            onOpen={() => {
              props.getLikes(() => {
                setLikes(props.globalLikes[props.id]);
              });
            }}
            position="right center"
            closeOnDocumentClick
          >
            <ul>
              {likes.map((like, index) => (
                <LikeItem
                  key={index}
                  firstName={like.firstName}
                  lastName={like.lastName}
                />
              ))}
            </ul>
          </Popup>

          <Button className="button" size="sm" onClick={props.onLike}>
            <span className="fa fa-thumbs-up" />
          </Button>
        </div>

        {show.isActive}
      </Row>
      {show ? <p> {props.content}</p> : ""}
    </ListGroupItem>
  );
};

const LikeItem = function (props) {
  return (
    <section className="p-1 mb-2 bg-primary text-white">
      {props.firstName} {props.lastName}
    </section>
  );
};

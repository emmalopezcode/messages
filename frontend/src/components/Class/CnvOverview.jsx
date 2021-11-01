import React, { Component } from "react";
import { Link, useLocation } from "react-router-dom";
import { ListGroup, ListGroupItem, Col, Row, Button } from "react-bootstrap";
import CnvModal from "./CnvModal";
import { ConfDialog } from "../components";
import "./CnvOverview.css";

export default class CnvOverview extends Component {
  constructor(props) {
    super(props);

    this.props.updateCnvs();
    this.state = {
      showCnvNew: false,
      showCnvEdit: false,
      showDel: false,
      activeCnv: null,
    };
  }

  openNewCnv = () => {
    this.setState({ showCnvNew: true });
  };

  closeNewCnv = (result) => {
    if (result.status === "Ok") {
      this.props.addCnv({ title: result.title });
    }

    this.setState({ showCnvNew: false, activeCnv: null });
  };

  openCnvEdit = (cnv) => {
    this.setState({ showCnvEdit: true, activeCnv: cnv });
  };

  closeCnvEdit = (result) => {
    if (result.status === "Ok") {
      this.props.modCnv(this.state.activeCnv.id, result.title);
    }

    this.setState({ activeCnv: null, showCnvEdit: false });
  };

  openDelConfirm = (cnv) => {
    this.setState({ activeCnv: cnv, showDel: true });
  };

  closeDelConfirm = (cnv) => {
    this.props.delCnv(this.state.activeCnv.id);
    this.setState({ activeCnv: null, showDel: false });
  };

  render() {
    var cnvItems = [];

    this.props.Cnvs.forEach((cnv) => {
      if (
        this.props.location.pathname === "/allCnv" ||
        this.props.Prss.id === cnv.ownerId
      )
        cnvItems.push(
          <CnvItem
            key={cnv.id}
            showControls={cnv.ownerId === this.props.Prss.id}
            onDelete={() => this.openDelConfirm(cnv)}
            onEdit={() => this.openCnvEdit(cnv)}
            id={cnv.id}
            title={cnv.title}
            lastMessage={cnv.lastMessage}
          />
        );
    });

    return (
      <section className="container" color="#AAAAAA">
        <h1>Cnv Overview</h1>
        <ListGroup>{cnvItems}</ListGroup>
        {cnvItems.length === 0 ? (
          <div>Looks like you havent started any conversations</div>
        ) : (
          ""
        )}
        <Button
          className="button"
          variant="primary"
          onClick={() => this.openNewCnv()}
        >
          New Conversation
        </Button>

        <CnvModal
          show={this.state.showCnvNew}
          title={"New Conversation"}
          onDismiss={this.closeNewCnv}
        />
        <CnvModal
          show={this.state.showCnvEdit}
          title={"Edit title"}
          cnv={this.state.activeCnv}
          onDismiss={this.closeCnvEdit}
        />
        <ConfDialog
          show={this.state.showDel}
          title="Delete Conversation"
          body={`Are you sure you want to delete the Conversation 
               ${this.state.activeCnv ? this.state.activeCnv.title : ""}`}
          buttons={["Yes", "Abort"]}
          onClose={this.closeDelConfirm}
        />
      </section>
    );
  }
}

// A Cnv list item
const CnvItem = function (props) {
  return (
    <ListGroupItem>
      <Row>
        <Col sm={4}>
          <Link
            to={{
              pathname: "/CnvDetail/" + props.id,
              cnvInfo: { id: props.id, title: props.title },
            }}
          >
            {props.title}
          </Link>
        </Col>
        <Col sm={4}>
          {props.lastMessage
            ? new Intl.DateTimeFormat("us", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }).format(new Date(props.lastMessage))
            : "No messages yet"}
        </Col>
        {props.showControls ? (
          <div className="float-right">
            <Button className="button" size="sm" onClick={props.onDelete}>
              <span className="fa fa-trash" />
            </Button>
            <Button size="sm" onClick={props.onEdit}>
              <span className="fa fa-edit" />
            </Button>
          </div>
        ) : (
          ""
        )}
      </Row>
    </ListGroupItem>
  );
};

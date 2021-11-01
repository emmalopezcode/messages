import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListGroup, ListGroupItem, Col, Row, Button } from "react-bootstrap";
import CnvModal from "./CnvModal";
import { ConfDialog } from "../components";
import { useSelector } from "react-redux";
import "./CnvOverview.css";

export default (props) => {
  const [state, updateState] = useState({
    showCnvNew: false,
    showCnvEdit: false,
    showDel: false,
    activeCnv: null,
  });

  const Cnvs = useSelector((state) => state.Cnvs);

  let openNewCnv = () => {
    updateState({ ...state, showCnvNew: true });
  };

  let closeNewCnv = (result) => {
    if (result.status === "Ok") {
      props.addCnv({ title: result.title });
    }

    updateState({ ...state, showCnvNew: false, activeCnv: null });
  };

  let openCnvEdit = (cnv) => {
    updateState({ ...state, showCnvEdit: true, activeCnv: cnv });
  };

  let closeCnvEdit = (result) => {
    if (result.status === "Ok") {
      props.modCnv(state.activeCnv.id, result.title);
    }

    updateState({ ...state, activeCnv: null, showCnvEdit: false });
  };

  let openDelConfirm = (cnv) => {
    updateState({ ...state, activeCnv: cnv, showDel: true });
  };

  let closeDelConfirm = (cnv) => {
    props.delCnv(state.activeCnv.id);
    updateState({ ...state, activeCnv: null, showDel: false });
  };

  return (
    <section className="container" color="#AAAAAA">
      <h1 className="title">
        {props.location.pathname === "/allCnv"
          ? "All Message Threads"
          : "My Threads"}
      </h1>
      <div className="grid">
        {Cnvs.map((cnv, index) =>
          (props.location.pathname === "/allCnv" ||
          props.Prss.id === cnv.ownerId) && (
            <CnvItem
              key={cnv.id}
              showControls={cnv.ownerId === props.Prss.id}
              onDelete={() => openDelConfirm(cnv)}
              onEdit={() => openCnvEdit(cnv)}
              id={cnv.id}
              title={cnv.title}
              lastMessage={cnv.lastMessage}
            />
          )
        )}
      </div>
      {Cnvs.length === 0 && (
        <div>Looks like you havent started any conversations</div>
      )}
      <Button className="button" variant="primary" onClick={() => openNewCnv()}>
        New Conversation
      </Button>

      <CnvModal
        show={state.showCnvNew}
        title={"New Conversation"}
        onDismiss={closeNewCnv}
      />
      <CnvModal
        show={state.showCnvEdit}
        title={"Edit title"}
        cnv={state.activeCnv}
        onDismiss={closeCnvEdit}
      />
      <ConfDialog
        show={state.showDel}
        title="Delete Conversation"
        body={`Are you sure you want to delete the Conversation 
               ${state.activeCnv ? state.activeCnv.title : ""}`}
        buttons={["Yes", "Abort"]}
        onClose={closeDelConfirm}
      />
    </section>
  );
};

const CnvItem = function (props) {
  console.log(new Date(props.lastMessage));

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
    <Link
      to={{
        pathname: "/CnvDetail/" + props.id,
        cnvInfo: { id: props.id, title: props.title },
      }}
      className="list-group-item"
    >
      <h3>{props.title}</h3>
      <div>
        {props.lastMessage ? since(props.lastMessage) : "No messages yet"}
      </div>
      <div>
        {props.showControls ? (
          <div className="edit">
            <Button className="cnv-btn" size="sm" onClick={props.onDelete}>
              <span className="fa fa-trash" />
            </Button>
            <Button className="cnv-btn" size="sm" onClick={props.onEdit}>
              <span className="fa fa-edit" />
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
    </Link>
  );
};
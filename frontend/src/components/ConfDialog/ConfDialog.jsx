import React from "react";
import { Modal, Button } from "react-bootstrap";

export default (props) => (
  <Modal show={props.show} onHide={() => props.onClose("Dismissed")}>
    <Modal.Header closeButton>
      <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{props.body}</Modal.Body>
    <Modal.Footer>
      {props.buttons.map((btnText, i) => (
        <Button key={i} onClick={() => props.onClose(btnText)}>
          {btnText}
        </Button>
      ))}
    </Modal.Footer>
  </Modal>
);

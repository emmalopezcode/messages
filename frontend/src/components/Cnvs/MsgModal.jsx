import React, { Component } from "react";
import { Modal, Button, Form, FormControl, FormGroup } from "react-bootstrap";

export default class MsgModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgContent: (this.props.msg && this.props.msg.content) || "",
    };
  }

  close = (result) => {
    this.props.onDismiss &&
      this.props.onDismiss({
        status: result,
        msg: this.state.msgContent,
      });
  };

  getValidationState = () => {
    if (this.state.msgContent) {
      return null;
    }
    return "warning";
  };

  handleChange = (e) => {
    this.setState({ msgContent: e.target.value });
  };

  componentDidUpdate = (nextProps) => {
    if (nextProps.showModal) {
      this.setState({ cnvTitle: (nextProps.cnv && nextProps.cnv.title) || "" });
    }
  };

  render() {
    return (
      <Modal show={this.props.show} onHide={() => this.close("Cancel")}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FormGroup
              controlId="formBasicText"
              validationstate={this.getValidationState()}
            >
              <Form.Label>Message body</Form.Label>
              <FormControl
                type="text"
                value={this.state.msgContent}
                placeholder="Enter text"
                onChange={this.handleChange}
              />
              <FormControl.Feedback />
              <Form.Text className="text-muted">
                Message content is required
              </Form.Text>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.close("Ok")}>Post</Button>
          <Button onClick={() => this.close("Cancel")}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

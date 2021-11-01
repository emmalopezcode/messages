import React, { Component } from "react";
import { Modal, Button, Form, FormControl, FormGroup } from "react-bootstrap";

export default class CnvModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cnvTitle: (this.props.activeCnv && this.props.activeCnv.title) || "",
    };
  }

  close = (result) => {
    this.props.onDismiss &&
      this.props.onDismiss({
        status: result,
        title: this.state.cnvTitle,
      });
  };

  getValidationState = () => {
    if (this.state.cnvTitle) {
      return null;
    }
    return "warning";
  };

  handleChange = (e) => {
    this.setState({ cnvTitle: e.target.value });
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
              <Form.Label>Conversation Title</Form.Label>
              <FormControl
                type="text"
                value={this.state.cnvTitle}
                placeholder="Enter text"
                onChange={this.handleChange}
              />
              <FormControl.Feedback />
              <Form.Text className="text-muted">Title is required</Form.Text>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={this.state.cnvTitle.length === 0}
            onClick={() => this.close("Ok")}
          >
            Ok
          </Button>
          <Button onClick={() => this.close("Cancel")}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

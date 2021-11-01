import React, { useState } from "react";
import { ConfDialog } from "../components";
import { Form, FormGroup, Button, Alert } from "react-bootstrap";

import "./Register.css";

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <Form.Label>{label}</Form.Label>
      <Form.Control {...props} />
      {help && <Form.Text className="text-muted">{help}</Form.Text>}
    </FormGroup>
  );
}

export default (props) => {
  const [info, setInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordTwo: "",
    termsAccepted: false,
    role: 0,
    offerSignIn: false,
    paramString: "",
  });

  let submit = () => {
    let { firstName, lastName, email, password, termsAccepted, role } = info;

    const user = {
      firstName,
      lastName,
      email,
      password,
      termsAccepted,
      role,
    };

    props.register(user, () => {
      const newState = { ...info };
      newState.offerSignIn = true;
      setInfo(newState);
    });

    try {
      var newParamString = this.props.Errs.details[0].params[0];
      setInfo({ paramString: newParamString });
    } catch (e) {}
  };

  let handleChange = (ev) => {
    let newState = { ...info };

    switch (ev.target.type) {
      case "checkbox":
        newState[ev.target.id] = ev.target.checked;
        break;
      default:
        newState[ev.target.id] = ev.target.value;
    }
    setInfo(newState);
  };

  let formValid = () => {
    let s = info;

    return (
      s.email &&
      s.lastName &&
      s.password &&
      s.password === s.passwordTwo &&
      s.termsAccepted
    );
  };

  let passwordsDontMatch = () => {
    return info.password !== info.passwordTwo;
  };

  return (
    <div className="container">
      <form>
        <h1>Register</h1>
        <FieldGroup
          id="email"
          type="email"
          label="Email Address"
          placeholder="Enter email"
          value={info.email}
          onChange={(ev) => handleChange(ev)}
          required={true}
        />

        <FieldGroup
          id="firstName"
          type="text"
          label="First Name"
          placeholder="Enter first name"
          value={info.firstName}
          onChange={(ev) => handleChange(ev)}
        />

        <FieldGroup
          id="lastName"
          type="text"
          label="Last Name"
          placeholder="Enter last name"
          value={info.lastName}
          onChange={(ev) => handleChange(ev)}
          required={true}
        />

        <FieldGroup
          id="password"
          type="password"
          label="Password"
          value={info.password}
          onChange={(ev) => handleChange(ev)}
          required={true}
        />

        <FieldGroup
          id="passwordTwo"
          type="password"
          label="Repeat Password"
          value={info.passwordTwo}
          onChange={(ev) => handleChange(ev)}
          required={true}
          help="Repeat your password"
        />

        <Form.Check
          id="termsAccepted"
          value={info.termsAccepted}
          onChange={(ev) => handleChange(ev)}
          label="Do you accept the terms and conditions?"
        />

        <Button
          variant="primary"
          onClick={() => submit()}
          disabled={!formValid()}
        >
          Submit
        </Button>
      </form>

      {passwordsDontMatch() ? (
        <Alert variant="warning">Passwords don't match</Alert>
      ) : (
        ""
      )}

      <ConfDialog
        show={info.offerSignIn}
        title="Registration Success"
        body={`Would you like to log in as ${info.firstName} ${info.lastName}?`}
        buttons={["YES", "NO"]}
        onClose={(answer) => {
          setInfo({ offerSignIn: false });
          if (answer === "YES") {
            props.signIn({ email: info.email, password: info.password }, () =>
              props.history.push("/")
            );
          }
        }}
      />
    </div>
  );
};

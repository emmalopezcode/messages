import React, { useState } from "react";
import {
  Form,
  FormGroup,
  Row,
  Col,
  FormControl,
  Button,
} from "react-bootstrap";
import "./SignIn.css";
import imgstr from "../../images/test.jpg";

export default (props) => {
  const [creds, setCreds] = useState({
    email: "emma.lopez@principia.edu",
    password: "testtest",
  });

  let signIn = (event) => {
    props.signIn(creds, () => {
      props.updateCnvs();
      props.history.push("/allCnvs");
    });
    event.preventDefault();
  };

  let handleChange = (event) => {
    const newState = { ...creds };
    newState[event.target.name] = event.target.value;
    setCreds(newState);
  };

  return (
    <section className="signin-container">
      <Form>
        <h1>Sign in</h1>
        <FormGroup controlId="formHorizontalEmail">
          Email
          <FormControl
            type="email"
            name="email"
            value={creds.email}
            onChange={(event) => handleChange(event)}
          />
        </FormGroup>
        <FormGroup controlId="formHorizontalPassword">
          Password
          <FormControl
            type="password"
            name="password"
            value={creds.password}
            onChange={(event) => handleChange(event)}
          />
        </FormGroup>
        <Button type="submit" onClick={signIn.bind(this)}>
          Sign in
        </Button>
      </Form>
    </section>
  );
};

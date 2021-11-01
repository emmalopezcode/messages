import React, { Component } from "react";
import {
  Register,
  SignIn,
  CnvOverview,
  CnvDetail,
  ConfDialog,
} from "../components";
import { Route, Redirect, Switch } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { errMap } from "../../api";
import LandingPageImage from "../../images/landing_page.svg";

import "./Main.css";

var ProtectedRoute = ({ component: Cmp, path, ...rest }) => {
  return (
    <Route
      path={path}
      render={(props) => {
        return Object.keys(rest.Prss).length !== 0 ? (
          <Cmp {...rest} />
        ) : (
          <Redirect to="/signin" />
        );
      }}
    />
  );
};

class Main extends Component {
  signedIn() {
    return Object.keys(this.props.Prss).length !== 0; // Nonempty Prss obj
  }

  render() {
    console.log(this.props);

    return (
      <div className="main-wrapper">
        <div>
          <Navbar expand="md nav">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="nav-flex">
                {this.signedIn()
                  ? [
                      <LinkContainer className="nav-btn" to="/allCnv" key={0}>
                        <Nav.Link> All Conversations</Nav.Link>
                      </LinkContainer>,
                      <LinkContainer className="nav-btn" to="/myCnvs" key={1}>
                        <Nav.Link>My Conversations</Nav.Link>
                      </LinkContainer>,
                      <Nav.Item
                        key={2}
                        className="nav-btn"
                        onClick={() => this.props.signOut()}
                      >
                        Sign out
                      </Nav.Item>,
                    ]
                  : [
                      <LinkContainer className="nav-btn" to="/signin" key={0}>
                        <Nav.Link>Sign In</Nav.Link>
                      </LinkContainer>,
                      <LinkContainer className="nav-btn" to="/register" key={1}>
                        <Nav.Link>Register</Nav.Link>
                      </LinkContainer>,
                    ]}
                {this.signedIn() ? (
                  <Navbar.Text key={1} className="logged-in">
                    {`Logged in as: ${this.props.Prss.firstName}
                            ${this.props.Prss.lastName}`}
                  </Navbar.Text>
                ) : (
                  ""
                )}
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>

        <Switch>
          <Route
            exact
            path="/"
            component={() =>
              this.props.Prss ? <LandingPage /> : <Redirect to="/signin" />
            }
          />
          <Route path="/signin" render={() => <SignIn {...this.props} />} />
          <Route path="/register" render={() => <Register {...this.props} />} />
          <ProtectedRoute
            path="/allCnv"
            component={CnvOverview}
            {...this.props}
          />
          <ProtectedRoute
            path="/myCnvs"
            component={CnvOverview}
            {...this.props}
          />
          <ProtectedRoute
            path="/CnvDetail"
            component={CnvDetail}
            {...this.props}
          />
        </Switch>

        <ConfDialog
          show={Object.keys(this.props.Errs).length > 0}
          title="Error"
          body={`${
            errMap["en"][this.props.Errs.tag]
              ? errMap["en"][this.props.Errs.tag]
              : ""
          } 
                  ${this.props.Errs.params ? this.props.Errs.params[0] : ""}
                  ${
                    typeof this.props.Errs === "string" ? this.props.Errs : ""
                  }`}
          buttons={["OK"]}
          onClose={() => {
            this.props.clearErrs();
          }}
        />
      </div>
    );
  }
}

function LandingPage() {
  return (
    <div style={{ margin: "0 15%" }}>
      <img
        src={LandingPageImage}
        style={{ margin: "8% auto", width: "50vw" }}
      ></img>
      <div className="overlay">
        <div className="msg-user">message anyone</div>
        <div className="msg-other">anywhere</div>
      </div>
    </div>
  );
}

export default Main;

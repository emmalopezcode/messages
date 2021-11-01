// This middleware assumes cookieParser has been "used" before this
// var crypto = require('crypto');
//import router from './Account/Prss';
import { randomBytes } from "crypto";
import { Response, Request } from "express";

var ssnsByCookie = {}; // All currently logged-in Sessions indexed by token
var ssnsById: Session[] = [];
var duration = 7200000; // Two hours in milliseconds
var cookieName = "CHSAuth"; // Cookie key for authentication tokens
var ssnId = 0;

// Session-constructed objects represent an ongoing login session, including
// user details, login time, and time of last use, the latter for the purpose
// of timing out sessions that have been unused for too long.

export type user = {
  id: number | string;
  loginTime: Date | number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
};

export class Session {
  // All currently logged-in Sessions indexed by token
  private static ssnsByCookie: { [key: string]: Session } = {};
  private static ssnsById: Session[] = []; // Sessions by sequential session ID
  static readonly duration = 7200000; // Two hours in milliseconds
  static readonly cookieName = "CHSAuth"; // Cookie key for auth tokens

  static findById = (id: number | string) => Session.ssnsById[id as number];
  static getAllIds = () => Object.keys(Session.ssnsById);
  static get = (id: number | string) => {
    return Session.ssnsById[Number(id)];
  };
  static getSsnsById = () => {
    return Session.ssnsById;
  };
  static getSsnsByCookie = () => {
    return Session.ssnsByCookie;
  };
  static rmSsnByCookie(ssn: Session): void {
    delete Session.ssnsByCookie[ssn.authToken];
  }

  static logOutById(id: number | string) {
    console.log("logging out " + id);
    var index: number = Session.findSsnIndex(id);
    var ssn = Session.ssnsById[index];
    delete Session.ssnsByCookie[ssn.authToken];
    Session.ssnsById.splice(index, 1);
  }

  static resetSsnId = () => {
    ssnId = 0;
  };

  static findSsnIndex(id: number | string): number {
    for (const i in Session.ssnsById)
      if (Number(Session.ssnsById[i].id) === Number(id)) return Number(i);

    return -1;
  }

  static logOutEveryone() {
    Session.ssnsByCookie = {};
    Session.ssnsById = [];
  }

  static deletePerson(prsId: number | string) {
    //removing each from Session.ssnsById
    Session.ssnsById = Session.ssnsById.filter((ssn) => {
      if (Number(ssn.prsId) !== Number(prsId)) {
        return true;
      } else {
        return false;
      }
    });
    //removing each from Session.ssnsByCookie
    var toBeDeleted = [];
    for (const key in Session.ssnsByCookie) {
      if (Number(Session.ssnsByCookie[key].prsId) === Number(prsId)) {
        toBeDeleted.push(key);
      }
    }
    for (const key of toBeDeleted) {
      delete Session.ssnsByCookie[key];
    }
  }

  static resetAll = () => {
    Session.ssnsById = [];
    Session.ssnsByCookie = {};
  };

  id: number; // ID of session
  prsId: number; // ID of person logged in
  authToken: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
  lastUsed: number;
  loginTime: number;

  isAdmin(): boolean {
    return this.role === 1;
  }

  // Log out a user by removing this Session
  logOut() {
    Session.ssnsById.splice(this.id, 1);
    delete Session.ssnsByCookie[this.authToken];
  }

  constructor(user: user, res: Response) {
    var authToken: string = randomBytes(16).toString("hex"); // Make random token

    res.cookie(cookieName, authToken, { maxAge: duration, httpOnly: true }); // 1
    Session.ssnsByCookie[authToken] = this;
    this.id = ssnId;
    ssnId++;
    Session.ssnsById.push(this);

    this.authToken = authToken;
    this.prsId = Number(user.id);
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.loginTime = this.lastUsed = new Date().getTime();
  }

  // Function router that will find any Session associated with |req|, based on
  // cookies, delete the Session if it has timed out, or attach the Session to
  // |req| if it's current If |req| has an attached Session after this process,
  // then down-chain routes will treat |req| as logged-in.
  static Router = function (req: Request, res: Response, next: Function) {
    var cookie = req.cookies[Session.cookieName];
    var session = cookie && Session.ssnsByCookie[cookie];

    if (session) {
      // If the session was last used more than |duration| mS ago..
      if (session.lastUsed < new Date().getTime() - Session.duration)
        session.logOut();
      else {
        req.session = session;
      }
    }
    next();
  };
}

export let router = Session.Router;

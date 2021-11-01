import { Request, Router, Response } from "express";
import { waterfall } from "async";
import { queryCallback, PoolConnection, FieldInfo, OkPacket } from "mysql";
import { Session } from "./Session";

export let Tags = {
  noLogin: "noLogin", // No active session/login
  noPermission: "noPermission", // Login lacks permission.
  missingField: "missingField", // Field missing. Params[0] is field name
  badValue: "badValue", // Bad field value.  Params[0] is field name
  notFound: "notFound", // Entity not present in DB
  badLogin: "badLogin", // Email/password combination invalid
  dupEmail: "dupEmail", // Email duplicates an existing email
  noTerms: "noTerms", // Acceptance of terms is required.
  forbiddenRole: "forbiddenRole", // Cannot set to this role
  noOldPwd: "noOldPwd", // Password change requires old password
  dupTitle: "dupTitle", // Title duplicates an existing cnv title
  queryFailed: "queryFailed",
  forbiddenField: "forbiddenField",
  oldPwdMismatch: "oldPwdMismatch",
};

type Error = {
  tag: string | null;
  params: string[] | null;
};

export class Validator {
  errors: Error[];
  session: Session;
  res: Response | null;
  req: Request;

  constructor(req: Request, res: Response) {
    this.errors = [];
    this.session = req.session!;
    this.res = res;
    this.req = req;
  }

  check(
    test: boolean | number,
    tag: string | null,
    params: string[] | null,
    cb: Function | null
  ) {
    if (!test) this.errors.push({ tag: tag, params: params });

    if (this.errors.length) {
      if (this.res) {
        if (this.errors[0].tag === Tags.noPermission)
          this.res.status(403).end();
        else {
          console.log(this.errors);
          this.res.status(400).json(this.errors);
        }
        this.res = null; // Preclude repeated closings
      }
      if (cb) cb(this);
    }
    return !this.errors.length;
  }

  chain(test: boolean, tag: string, params: string[] | null) {
    if (!test) {
      this.errors.push({ tag: tag, params: params });
    }
    return this;
  }

  checkValueLength(param: string, length: number) {
    var body = this.req.body;

    if (param in body) {
      if (body[param] === null)
        this.errors.push({ tag: Tags.missingField, params: [param] });
      else if (body[param].length > length)
        this.errors.push({ tag: Tags.badValue, params: [param] });
      else if (!body[param].length && param !== "firstName")
        this.errors.push({ tag: Tags.missingField, params: [param] });
    }
    return this;
  }

  checkAdmin(cb: Function | null) {
    return this.check(
      this.session && this.session.isAdmin(),
      Tags.noPermission,
      null,
      cb
    );
  }

  checkPrsOK(prsId: number | string, cb: Function) {
    return this.check(
      this.session &&
        (Number(this.session.prsId) === Number(prsId) ||
          this.session.isAdmin()),
      Tags.noPermission,
      null,
      cb
    );
  }

  hasFields(obj: any, fieldList: string[], cb: Function | null) {
    var self = this;

    fieldList.forEach(function (name) {
      self.chain(
        obj.hasOwnProperty(name) && obj[name] !== null,
        Tags.missingField,
        [name]
      );
    });

    return this.check(true, null, null, cb);
  }

  hasOnlyFields(obj: any, allowedFields: string[], cb: Function | null) {
    var self = this;
    for (const key in obj) {
      console.log(key);
      self.chain(allowedFields.indexOf(key) > -1, Tags.forbiddenField, [key]);
    }

    return this.check(true, null, null, cb);
  }
}

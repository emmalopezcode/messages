import { Request, Response, Router } from "express";
import { Tags } from "../Validator";
import { waterfall } from "async";
import { FieldInfo, OkPacket, queryCallback, PoolConnection } from "mysql";
import { Session, user } from "../Session";
import { Person } from "./Prss";
import { Validator } from "../Validator";

var router = Router({ caseSensitive: true });

type ssn = {
  id: number;
  prsId: number | string;
  loginTime: Date | number;
};

const baseURL = "/Ssns";

router.get("/", function (req, res) {
  console.log("were in mate");
  var body: ssn[] = [],
    ssn: Session;
  var vld: Validator = req.validator!;
  var cnn: PoolConnection = req.cnn!;

  if (vld.checkAdmin(null)) {
    Session.getAllIds().forEach((id) => {
      ssn = Session.get(id);
      var x: ssn = { id: ssn.id, prsId: ssn.prsId, loginTime: ssn.loginTime };
      body.push(x);
    });
    res.json(body);
  }

  cnn.release();
});

router.post("/", function (req, res) {
  var ssn;
  var cnn: PoolConnection = req.cnn!;
  var vld: Validator = req.validator!;
  var allowedParams = ["email", "password"];

  console.log(`${req.body.email}   ${req.body.password}`);

  waterfall(
    [
      (cb: queryCallback) => {
        cnn.chkQry(
          "select * from Person where email = ?",
          [req.body.email],
          cb
        );
      },
      (result: Person[], fields: FieldInfo[], cb: Function) => {
        if (
          vld.hasOnlyFields(req.body, allowedParams, cb) &&
          vld.check(
            result.length &&
              result[0].password === req.body.password &&
              result[0].email.toLowerCase() === req.body.email.toLowerCase(),
            Tags.badLogin,
            null,
            cb
          )
        ) {
          var user: user = {
            id: result[0].id,
            loginTime: new Date().getTime(),
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            email: result[0].email,
            role: Number(result[0].role),
          };
          ssn = new Session(user, res);
          res
            .location(baseURL + "/" + ssn.id)
            .status(200)
            .end();
          cb();
        }
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

router.delete("/:id", function (req, res) {
  var vld: Validator = req.validator!;
  var cnn: PoolConnection = req.cnn!;

  var ssn = Session.get(Session.findSsnIndex(Number(req.params.id)));
  waterfall(
    [
      function (cb: Function) {
        if (
          vld.check(ssn !== undefined, Tags.notFound, null, cb) &&
          vld.checkPrsOK(ssn.prsId, cb)
        ) {
          console.log("so we get here?");
          Session.logOutById(req.params.id);
          Session.rmSsnByCookie(ssn);
          res.end();
          cb();
        }
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

router.get("/:id", function (req, res) {
  var vld: Validator = req.validator!;
  var ssn = Session.get(Session.findSsnIndex(req.params.id));
  var cnn: PoolConnection = req.cnn!;

  waterfall(
    [
      function (cb: Function) {
        if (
          vld.check(ssn !== undefined, Tags.notFound, null, cb) &&
          vld.checkPrsOK(ssn.prsId, cb)
        ) {
          res.json({ id: ssn.id, prsId: ssn.prsId, loginTime: ssn.loginTime });
        }
        cb();
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

module.exports = router;

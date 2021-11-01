import { Request, Response, Router } from "express";
import { Tags } from "../Validator";
import { waterfall } from "async";
import { FieldInfo, OkPacket, queryCallback, PoolConnection } from "mysql";
import { Session } from "../Session";
import { Like } from "../Conversation/Msgs";
var router = Router({ caseSensitive: true });

const baseURL = "/Prss";

export interface Person {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  whenRegistered: Date | bigint;
  termsAccepted: Date | bigint;
  role: number | string;
}

router.get("/", (req, res) => {
  console.log("get prss so this is being called");

  var admin = req.session && req.session.isAdmin();
  var params = req.query.email;
  var cnn: PoolConnection = req.cnn!;
  var session: Session = req.session!;

  waterfall(
    [
      function (cb: queryCallback) {
        if (params) {
          console.log("correct tree");
          cnn.chkQry(
            "select id, email from Person where email like ?",
            [params + "%"],
            cb
          );
        } else cnn.chkQry("select id, email from Person", [params + "%"], cb);
      },

      function (sqlRes: Person[], fields: FieldInfo[], cb: Function) {
        //{"email":sqlRes.email,"id":sqlRes.id}
        var actualResponse: Person[] = [];
        if (!admin) {
          for (var i = 0; i < sqlRes.length; i++) {
            if (sqlRes[i].email === session.email) {
              actualResponse = [sqlRes[i]];
            }
          }
        } else {
          actualResponse = sqlRes;
        }
        res.json(actualResponse);
        cb();
      },
    ],
    (anchor) => {
      cnn.release();
    }
  );
});

router.get("/:id", function (req, res) {
  console.log(req.params.id);
  var vld = req.validator!;
  var cnn: PoolConnection = req.cnn!;

  waterfall(
    [
      function (cb: queryCallback) {
        if (vld.checkPrsOK(req.params.id, cb))
          cnn.chkQry("select * from Person where id = ?", [req.params.id], cb);
      },
      function (prsArr: Person[], fields: FieldInfo[], cb: Function) {
        if (vld.check(prsArr.length, Tags.notFound, null, cb)) {
          delete prsArr[0].password;
          res.json(prsArr);
          cb();
        }
      },
    ],
    (err) => {
      cnn.release();
    }
  );
});

router.post("/", function (req, res) {
  console.log("post prss so this is being called");

  var vld = req.validator!; // Shorthands
  var admin: boolean = req.session! && req.session!.isAdmin();
  var cnn: PoolConnection = req.cnn!;
  var mandatoryParams = ["email", "lastName", "role"];
  var allowedParams = [
    "email",
    "password",
    "firstName",
    "lastName",
    "role",
    "termsAccepted",
  ];

  if (admin && !req.body.password) req.body.password = "*"; // Blocking password

  if (!req.body.password && !admin) {
    mandatoryParams.push("password");
  }

  waterfall(
    [
      function (cb: queryCallback) {
        // Check properties and search for Email duplicates
        //first check if it
        if (
          vld.hasFields(req.body, mandatoryParams, cb) &&
          vld.hasOnlyFields(req.body, allowedParams, cb) &&
          vld
            .chain(
              ("termsAccepted" in req.body && req.body.termsAccepted) || admin,
              Tags.noTerms,
              null
            )
            .checkValueLength("password", 50)
            .checkValueLength("firstName", 30)
            .checkValueLength("lastName", 50)
            .checkValueLength("email", 50)
            .check(req.body.role === 0 || admin, Tags.forbiddenRole, null, cb)
        ) {
          cnn.chkQry(
            "select * from Person where email = ?",
            req.body.email,
            cb
          );
        }
      },
      function (
        existingPrss: Person[],
        fields: FieldInfo[],
        cb: queryCallback
      ) {
        // If no duplicates, insert new Person
        if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
          var curr: Date = new Date();
          req.body.termsAccepted = req.body.termsAccepted && curr;
          req.body.whenRegistered = curr;
          cnn.chkQry("insert into Person set ?", req.body, cb);
        }
      },
      function (result: OkPacket, fields: FieldInfo[], cb: Function) {
        // Return location of inserted Person
        res.location(baseURL + "/" + result.insertId).end();
        //res.json([{test: 'this is a test'}]);
        cb();
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

// add in the inability to change if there is nothing there...
router.put("/:id", function (req: Request, res: Response) {
  var vld = req.validator!;
  var body = req.body;
  var session: Session = req.session!;

  var admin: boolean = session.isAdmin();
  var cnn = req.cnn!;
  var allowedParams = [
    "password",
    "firstName",
    "lastName",
    "role",
    "oldPassword",
  ];

  var roleNotZero = "role" in body && body.role !== 0;
  var passwordNoOld = "password" in body && !("oldPassword" in body);

  waterfall(
    [
      (cb: queryCallback) => {
        if (
          vld.checkPrsOK(req.params.id, cb) &&
          vld.hasOnlyFields(body, allowedParams, cb) &&
          vld
            .chain(!roleNotZero || admin, Tags.badValue, ["role"])
            .checkValueLength("firstName", 30)
            .checkValueLength("lastName", 50)
            .checkValueLength("email", 50)
            .chain(!("password" in body && !body.password), Tags.badValue, [
              "password",
            ])
            .check(!passwordNoOld || admin, Tags.noOldPwd, [], cb)
        ) {
          cnn.chkQry("select * from Person where id = ?", [req.params.id], cb);
        }
      },
      (prss: Person[], fields: FieldInfo[], cb: queryCallback) => {
        if (
          vld.check(prss.length, Tags.notFound, null, cb) &&
          vld.check(
            prss[0].password === req.body.oldPassword ||
              !("oldPassword" in body),
            Tags.oldPwdMismatch,
            null,
            cb
          )
        ) {
          delete body.id;
          delete body.oldPassword;
          if (Object.keys(body).length)
            cnn.chkQry(
              "update Person set ? where id = ?",
              [body, req.params.id],
              cb
            );
          //you have to have the matching param structure plus a false error pushed at the beginning
          else cb(null, null, fields);
        }
      },
      (result: OkPacket, fields: FieldInfo[], cb: Function) => {
        res.status(200).end();
        cb();
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

router.delete("/:id", function (req: Request, res: Response) {
  var vld = req.validator!;
  var cnn: PoolConnection = req.cnn!;

  waterfall(
    [
      function (cb: queryCallback) {
        cnn.chkQry("select * from `Like` where prsId = ?", [req.params.id], cb);
      },
      function (sqlRes: Like[], fields: FieldInfo[], cb: Function) {
        console.log(sqlRes);
        var likecbs: Function[] = sqlRes.map(
          (like) => (callback: queryCallback) => {
            cnn.chkQry(
              "update Message set numLikes = numLikes - 1 where id = ?",
              [like.msgId],
              callback
            );
          }
        );

        waterfall(likecbs, function (anchor) {
          cb();
        });
      },
      function (cb: queryCallback) {
        if (
          vld
            .chain(!isNaN(Number(req.params.id)), Tags.notFound, null)
            .checkAdmin(cb)
        ) {
          cnn.chkQry("DELETE from Person where id = ?", [req.params.id], cb);
        }
      },
      function (result: OkPacket, fields: FieldInfo[], cb: Function) {
        if (vld.check(result.affectedRows, Tags.notFound, null, cb)) {
          Session.deletePerson(req.params.id);
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

module.exports = router;

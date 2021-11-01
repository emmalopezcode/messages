import { Request, Router, Response } from "express";
var Tags = require("../Validator.js").Tags;
import { Validator } from "../Validator";
import { waterfall } from "async";
import { queryCallback, PoolConnection, FieldInfo, OkPacket } from "mysql";

export let router = Router({ caseSensitive: true });
const baseURL = "/Cnvs";
interface Conversation {
  id: number;
  title: string;
  lastMessage: Date | number;
  ownerId: number;
}

export interface Message {
  id?: string | number;
  whenMade: Date | number;
  content?: string;
  prsId?: number;
  email?: string;
  cnvId?: number;
  numLikes?: number;
}

router.get("/:cnvId", function (req: Request, res: Response) {
  var cnn: PoolConnection = req.cnn!;

  waterfall(
    [
      function (cb: queryCallback) {
        cnn?.chkQry(
          "select * from Conversation where id = ?",
          [req.params.cnvId],
          cb
        );
      },
      function (sqlRes: Conversation[], fields: FieldInfo[], cb: Function) {
        res.json(sqlRes[0]);
        cb();
      },
    ],
    function (err) {
      cnn?.release();
    }
  );
});

function compare(a: Message, b: Message): number {
  //a is younger than b
  if (a.whenMade < b.whenMade) return -1;
  else if (a.whenMade > b.whenMade) return 1;
  //they have the same whenMade
  else if (a.id! < b.id!) return -1;
  else if (a.id! > b.id!) return 1;
  else return 0;
}

router.get("/:cnvId/Msgs", function (req: Request, res: Response) {
  console.log("got to cnvId message");
  var dateTime = req.query.dateTime;
  var num: number = Number(req.query.num);
  var vld: Validator = req.validator!;

  waterfall(
    [
      function (cb: queryCallback) {
        if (dateTime)
          req.cnn?.chkQry(
            "select * from Message where cnvId = ? and whenMade >= ?",
            [req.params.cnvId, dateTime],
            cb
          );
        else
          req.cnn?.chkQry(
            "select * from Message where cnvId = ?",
            [req.params.cnvId],
            cb
          );
      },
      function (sqlRes: Message[], fields: FieldInfo[], cb: Function) {
        var actualResponse =
          num !== undefined && !isNaN(num) ? sqlRes.slice(0, num) : sqlRes;
        actualResponse = actualResponse.sort(compare);
        res.json(actualResponse);
        cb();
      },
    ],
    (anchor) => {
      req.cnn?.release();
    }
  );
});

router.post("/:cnvId/Msgs", function (req: Request, res: Response) {
  var cnn: PoolConnection = req.cnn!;
  var vld: Validator = req.validator!;
  var curr = new Date().getTime();
  console.log("got here");
  var mandatoryParams = ["content"];

  waterfall(
    [
      function (cb: queryCallback) {
        if (
          vld.hasFields(req.body, mandatoryParams, cb) &&
          vld.check(
            req.body.content.length <= 5000,
            Tags.badValue,
            ["content"],
            cb
          )
        ) {
          cnn.chkQry(
            "select * from Conversation where id = ?",
            [req.params.cnvId],
            cb
          );
        }
      },
      function (sqlRes: Message[], fields: FieldInfo[], cb: queryCallback) {
        if (vld.check(sqlRes.length, Tags.notFound, ["Conversation"], cb)) {
          var newMessage: Message = {
            whenMade: curr,
            cnvId: Number(req.params.cnvId),
            prsId: req.session?.prsId,
            email: req.session?.email,
            numLikes: 0,
            content: req.body.content,
          };

          cnn.chkQry("insert into Message set ?", [newMessage], cb);
        }
      },
      function (result: OkPacket, fields: FieldInfo[], cb: queryCallback) {
        console.log(result);

        res.location(baseURL + "/" + result.insertId).end();

        cnn.chkQry(
          "update Conversation set ? where id = ?",
          [{ lastMessage: curr }, req.params.cnvId],
          cb
        );
      },
      function (result: OkPacket, fields: FieldInfo[], cb: Function) {
        // Return location of inserted Person
        cb();
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

router.get("/", function (req: Request, res: Response) {
  var cnn = req.cnn;
  waterfall(
    [
      function (cb: queryCallback) {
        if (req.query.owner)
          cnn?.chkQry(
            "select * from Conversation where ownerId = ?",
            [req.query.owner],
            cb
          );
        else cnn?.chkQry("select * from Conversation", [], cb);
      },
      function (sqlRes: Conversation[], fields: FieldInfo[], cb: Function) {
        console.log("this is the response" + sqlRes + ".");
        res.json(sqlRes);
        cb();
      },
    ],
    function (err) {
      cnn?.release();
    }
  );
});

router.post("/", function (req: Request, res: Response) {
  var vld = req.validator!;
  var cnn = req.cnn!;
  var allowedParams = ["title"];

  waterfall(
    [
      function (cb: queryCallback) {
        if (
          vld.hasOnlyFields(req.body, allowedParams, cb) &&
          vld
            .checkValueLength("title", 80)
            .check("title" in req.body, Tags.missingField, ["title"], cb)
        )
          cnn.chkQry(
            "select * from Conversation where title = ?",
            req.body.title,
            cb
          );
      },
      function (
        existingCnv: Conversation[],
        fields: FieldInfo[],
        cb: queryCallback
      ) {
        if (vld.check(!existingCnv.length, Tags.dupTitle, null, cb)) {
          //  body.lastMessage = null;
          req.body.ownerId = req.session?.prsId;
          cnn.chkQry("insert into Conversation set ?", req.body, cb);
        }
      },
      function (insertRes: OkPacket, fields: FieldInfo[], cb: Function) {
        console.log(insertRes);

        res.location(baseURL + "/" + insertRes.insertId).end();
        cb();
      },
    ],
    function () {
      cnn.release();
    }
  );
});

router.put("/:cnvId", function (req: Request, res: Response) {
  var vld: Validator = req.validator!;
  var cnn: PoolConnection = req.cnn!;
  var cnvId = req.params.cnvId;
  //res.send('this is a test');

  waterfall(
    [
      function (cb: queryCallback) {
        if (
          vld
            .checkValueLength("title", 80)
            .check("title" in req.body, Tags.missingField, [], cb)
        )
          cnn.chkQry("select * from Conversation where id = ?", [cnvId], cb);
      },
      function (cnvs: Conversation[], fields: FieldInfo[], cb: queryCallback) {
        if (
          vld.check(cnvs.length, Tags.notFound, null, cb) &&
          vld.checkPrsOK(cnvs[0].ownerId, cb)
        )
          cnn.chkQry(
            "select * from Conversation where id <> ? && title = ?",
            [cnvId, req.body.title],
            cb
          );
      },
      function (
        sameTtl: Conversation[],
        fields: FieldInfo[],
        cb: queryCallback
      ) {
        if (vld.check(!sameTtl.length, Tags.dupTitle, null, cb))
          cnn.chkQry(
            "update Conversation set title = ? where id = ?",
            [req.body.title, cnvId],
            cb
          );
      },
      function (result: OkPacket, fields: FieldInfo[], cb: Function) {
        res.status(200).end();
        cb();
      },
    ],
    function (err) {
      req.cnn?.release();
    }
  );
});

router.delete("/:id", function (req: Request, res: Response) {
  var vld: Validator = req.validator!;

  waterfall(
    [
      function (cb: queryCallback) {
        req.cnn?.chkQry(
          "Select * from Conversation where id = ?",
          [req.params.id],
          cb
        );
      },
      function (
        result: Conversation[],
        fields: FieldInfo[],
        cb: queryCallback
      ) {
        console.log("result " + result);
        if (
          vld.check(result.length, Tags.notFound, ["Conversation"], cb) &&
          vld.checkPrsOK(result[0].ownerId, cb)
        ) {
          req.cnn?.chkQry(
            "DELETE from Conversation where id = ?",
            [req.params.id],
            cb
          );
        }
      },
      function (result: OkPacket, fields: FieldInfo[], cb: Function) {
        if (vld.check(result.affectedRows, Tags.notFound, null, cb)) {
          res.end();
          cb();
        }
      },
    ],
    function (err) {
      req.cnn?.release();
    }
  );
});

module.exports = router;

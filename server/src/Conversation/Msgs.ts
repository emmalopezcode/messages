import { Request, Response, Router } from "express";
import { Tags } from "../Validator";
import { waterfall } from "async";
import { OkPacket, queryCallback } from "mysql";
import { Message } from "./Cnvs";
import { Session } from "../Session";

var router = Router({ caseSensitive: true });

export interface Like {
  id?: string | number;
  prsId?: string | number;
  msgId?: string | number;
  firstName: string;
  lastName: string;
}

const baseURL = "/Msgs";

router.get("/:msgId", function (req, res) {
  var cnn = req.cnn!;
  var vld = req.validator!;

  waterfall(
    [
      function (cb: queryCallback) {
        cnn.chkQry(
          "select * from Message where id = ?",
          [req.params.msgId],
          cb
        );
      },
      function (sqlRes: Message[], fields: any, cb: Function) {
        if (vld.check(sqlRes.length, Tags.notFound, null, cb)) {
          var actualResponse = {
            id: sqlRes[0].id,
            whenMade: sqlRes[0].whenMade,
            email: sqlRes[0].email,
            content: sqlRes[0].content,
            numLikes: sqlRes[0].numLikes,
          };
          res.json(actualResponse);
          cb();
        }
      },
    ],
    function (err) {
      cnn.release();
    }
  );
});

function compare(a: Like, b: Like): number {
  if (a.lastName < b.lastName) {
    return -1;
  }
  if (a.lastName > b.lastName) {
    return 1;
  } else {
    if (a.firstName < b.firstName) {
      return -1;
    }
    if (a.firstName > b.firstName) {
      return 1;
    }
  }
  return 0;
}

router.get("/:msgId/Likes", function (req, res) {
  var num = Number(req.query.num);
  var cnn = req.cnn!;
  waterfall(
    [
      function (cb: queryCallback) {
        cnn.chkQry(
          "select * from `Like` where msgId = ?",
          [req.params.msgId],
          cb
        );
      },
      function (sqlRes: Like[], fields: any, cb: Function) {
        console.log(sqlRes);
        var setOfLikes = num
          ? sqlRes.slice(sqlRes.length - num, sqlRes.length)
          : sqlRes;
        console.log(setOfLikes);

        var actualResponse = [];
        for (const like of setOfLikes) {
          actualResponse.push({
            id: like.id,
            firstName: like.firstName,
            lastName: like.lastName,
          });
        }

        actualResponse = actualResponse.sort(compare);
        res.json(actualResponse);
        cb();
      },
    ],
    (anchor) => {
      cnn.release();
    }
  );
});

router.post("/:msgId/Likes", function (req, res) {
  var cnn = req.cnn!;
  var vld = req.validator!;
  var session: Session = req.session!;

  waterfall(
    [
      //check if the message in question exists
      function (cb: queryCallback) {
        console.log(req.params.msgId);
        cnn.chkQry(
          "select * from Message where id = ?",
          [req.params.msgId],
          cb
        );
      },
      //check if the message in question has already been liked by the person in question
      function (messageToLike: Message[], fields: any, cb: queryCallback) {
        if (vld.check(messageToLike.length, Tags.notFound, null, cb)) {
          cnn.chkQry(
            "select * from `Like` where msgId = ? && prsId = ?",
            [req.params.msgId, session.prsId],
            cb
          );
        }
      },
      //if not then add a like to it and increment the count of the likes on the message
      function (sqlRes: Like[], fields: any, cb: Function) {
        if (!sqlRes.length) {
          waterfall(
            [
              function (cb: queryCallback) {
                cnn.chkQry(
                  "update Message set numLikes=numLikes+1 where id = ?",
                  [req.params.msgId],
                  cb
                );
              },
              function (result: OkPacket, fields: any, cb: queryCallback) {
                var like: Like = {
                  msgId: req.params.msgId,
                  prsId: session.prsId,
                  firstName: session.firstName,
                  lastName: session.lastName,
                };

                cnn.chkQry("insert into `Like` set ?", [like], cb);
              },
              function (result: OkPacket, fields: any[], cb: Function) {
                console.log("updating location");

                res.location(baseURL + "/" + result.insertId).end();
                cb();
              },
            ],
            function (anchor) {
              cb(null);
            }
          );
        } else {
          res.location(baseURL + "/" + sqlRes[0].id).end();
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

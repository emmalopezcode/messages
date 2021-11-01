import { Request, Response, NextFunction } from "express";
import { PoolConnection, Pool, MysqlError, FieldInfo, createPool } from "mysql";

export class CnnPool {
  pool: Pool;
  // NOTE: Do *not* change this pool size.  It is required to be 1 in order
  // to demonstrate you are properly freeing connections!
  static readonly PoolSize: number = 1;
  static singleton: CnnPool = new CnnPool();

  constructor() {
    var poolCfg = require("./connection.json");
    poolCfg.connectionLimit = CnnPool.PoolSize;
    this.pool = createPool(poolCfg);
  }

  getConnection(cb: (err: MysqlError, connection: PoolConnection) => void) {
    this.pool.getConnection(cb);
  }

  static router(req: Request, res: Response, next: NextFunction) {
    console.log("Getting connection");
    CnnPool.singleton.getConnection(function (
      err: MysqlError,
      cnn: PoolConnection
    ) {
      if (err) {
        res.status(500).json("Failed to get connection " + err);
      } else {
        console.log("Connection acquired");
        // console.log(cnn);
        cnn.chkQry = function (qry: string, prms: string[], cb: Function) {
          // Run real qry, checking for error
          this.query(
            qry,
            prms,
            function (
              err: MysqlError | null,
              res: Response,
              fields: FieldInfo[] | undefined
            ) {
              if (err) res.status(500).json("Failed query " + qry);
              cb(err, res, fields);
            }
          );
        };
        req.cnn = cnn;
        next();
      }
    });
  }
}

import { InjectRedis } from "@nestjs-modules/ioredis";
import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";
import { CACHE_5M, CACHE_PAGE } from "../constants";

@Injectable()
export class CacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {
    redis.on("error", function (err) {
      console.log("- REDIS_ERR");
      console.log(err);
    });

    redis.on("connect", function () {
      if (redis.ping()) {
        console.log("- REDIS_CONNECT. OK");
      }
    });
  }

  async getCache(cache_key) {
    const cache_page = await this.get(cache_key);
    if ((CACHE_PAGE || process.env.NODE_ENV === "production") && cache_page) {
      console.log("Cache hit: " + cache_key);
      return cache_page;
    }
    return null;
  }

  async setCache(html, cache_key, ttl = CACHE_5M) {
    if (CACHE_PAGE || process.env.NODE_ENV === "production") {
      await this.set(cache_key, html, ttl);
    }
  }

  async delCache(cache_key) {
    if (CACHE_PAGE || process.env.NODE_ENV === "production") {
      await this.del(cache_key);
    }
  }

  async hmset(id, value, expire = -1, callback) {
    await this.redis.hset(id, value);
    if (expire > 0) {
      await this.redis.expire(id, expire);
    }
    callback();
    return 1;
  }

  async hmget(id, keys, expire = -1) {
    return this.redis.hmget(id, keys);

    /*return new Promise((resolve, reject) => {

		redis.HMGET(id, keys, function (err, reply) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			return resolve(reply);
		});
		//auto increse
		/!*if (expire > 0) {
			redis.expire(id, expire)
		}*!/
	});*/
  }

  async hset(id, key, value, expire = -1) {
    await this.redis.hset(id, key, JSON.stringify(value));
    if (expire > 0) {
      await this.redis.expire(id, expire);
    }
    return 1;

    /*return new Promise((resolve, reject) => {
		redis.HSET(id, key, JSON.stringify(value), function (err, reply) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			return resolve(reply);
		});
		redis.expire(id, expire)

	});*/
  }

  async hget(id, key) {
    return this.redis.hget(id, key);

    /*return new Promise((resolve, reject) => {
		redis.HGET(id, key, function (err, reply) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			// if (reply) {
			//     console.log("get cache success: " + key);
			// }
			return resolve(JSON.parse(reply));
		});
	});*/
  }

  async hgetall(id) {
    return this.redis.hgetall(id);

    /*return new Promise((resolve, reject) => {
		redis.hgetall(id, function (err, reply) {
			if (err) {
				console.log(err);
				return reject(err);
			}
			// if (reply) {
			//     console.log("get cache success: " + key);
			// }
			return resolve(reply);
		});
	});*/
  }

  async hdel(id, key) {
    return this.redis.hdel(id, key);
  }

  async set(id, value, expire = -1) {
    await this.redis.set(id, value);
    if (expire > 0) {
      await this.redis.expire(id, expire);
    }
    return 1;

    /*return new Promise((resolve, reject) => {
      if (expire > 0) {
        redis.SETEX(id, expire, value, function (err, reply) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          // console.log("set cache success: " + key);
          return resolve(reply);
        });
      } else {
        redis.SET(id, value, function (err, reply) {
          if (err) {
            console.log(err);
            return reject(err);
          }
          // console.log("set cache success: " + key);
          return resolve(reply);
        });
      }

    });*/
  }

  async get(id) {
    return this.redis.get(id);

    /*return new Promise((resolve, reject) => {
      redis.get(id, function (err, reply) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        // if (reply) {
        //     console.log("get cache success: " + key);
        // }
        return resolve(reply);
      });
    });*/
  }

  async exists(key) {
    return this.redis.exists(key, function (err, reply) {
      if (err) {
        console.log(err);
        return false;
      }
      return reply === 1;
    });
  }

  async del(ids) {
    return this.redis.del(ids);

    /*return new Promise((resolve, reject) => {
      redis.del(keys, function (err, reply) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        // console.log("delete cache success: " + key);
        return resolve(reply);
      });
    });*/
  }

  async keys(id) {
    return this.redis.keys(id);

    /*return new Promise((resolve, reject) => {
      redis.KEYS(string, function (err, reply) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        // if (reply) {
        //     console.log("get cache success: " + key);
        // }
        return resolve(reply);
      });
    });*/
  }

  async incr(id, val = 1) {
    await this.redis.incrby(`${id}`, val);
  }

  async hincr(id, key, val = 1) {
    await this.redis.hincrby(`${id}`, key, val);
    return 1;

    /*return new Promise((resolve, reject) => {
      redis.hincrby(id, key, val, function (err, reply) {
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(reply);
      });

    });*/
  }

  async lpushArrObj(id, data = [], allow_fields = null, expire = 0) {
    try {
      const data_ok = [];
      data.map((item) => {
        data_ok.push(JSON.stringify(item));
      });
      await this.redis.lpush(`${id}`, ...data_ok);
      return 1;

      /*
      let async_data = [];
      data.map(item => {
        async_data.push(redis.lpush(id, JSON.stringify(item)))
      })
      await Promise.all(async_data).then().catch(function (err) {console.error('ERROR lpushArrObj')});*/
    } catch (err) {
      //console.error(err);
      console.error("ERROR lpushArrObj");
    }
  }

  async rpop(id, num = 1) {
    return this.redis.rpop(id);

    /*return new Promise((resolve, reject) => {
      redis.rpop(id , function (err, data) {
        if (err) {
          console.error(err);
          return reject(null);
        }
        return resolve(JSON.parse(data));
      });
    });*/
  }

  async lpushArr(id, data = [], expire = 0) {
    try {
      await this.redis.lpush(id, ...data);
    } catch (err) {
      console.error(err);
    }
  }
  
  async flushdb(db: number) {
    await this.redis.select(db);
    await this.redis.flushdb();
  }
}

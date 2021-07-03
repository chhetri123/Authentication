const fs = require("fs");
const crypto = require("crypto");
const utils = require("util");
const scrypt = utils.promisify(crypto.scrypt);
class UserRepo {
  constructor(filename) {
    if (!filename) throw new Error("Creating new file");
    this.filename = filename;

    try {
      fs.accessSync(this.filename);
    } catch (err) {
      fs.writeFileSync(this.filename, []);
    }
  }

  async getAll() {
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
  }
  async getByOne(attr) {
    const records = await this.getAll();
    for (let record of records) {
      let found = true;
      for (let key in attr) {
        if (record[key] !== attr[key]) {
          found = false;
        }
      }
      if (found) {
        return record;
      }
    }
  }

  async writeAll(record) {
    await fs.promises.writeFile(this.filename, JSON.stringify(record, null, 2));
  }
  randomID() {
    return crypto.randomBytes(16).toString("hex");
  }
  async getById(id) {
    const record = await this.getAll();
    return record.find((acc) => acc.id === id) || false;
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecord = records.filter((record) => record.id != id);
    await this.writeAll(filteredRecord);
  }

  async comparePassword(saved, supplied) {
    // if (!(await this.getById(savedID))) return false;
    // const pass = await this.getById(savedID);
    const [hashed, salt] = saved.split(".");
    const buffSupply = await scrypt(supplied, salt, 64);
    return hashed === buffSupply.toString("hex");
  }

  async createAccount(attr) {
    attr.id = this.randomID();
    const salt = crypto.randomBytes(8).toString("hex");

    const bufPassword = await scrypt(attr.password, salt, 64);
    const records = await this.getAll();
    const record = {
      ...attr,
      password: `${bufPassword.toString("hex")}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);
    return record;
  }
}

module.exports = new UserRepo("user.json");

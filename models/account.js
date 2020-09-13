"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.hasMany(models.Transaction, {
        foreignKey: { name: "account_id" },
        onDelete: "CASCADE",
      });
    }
  }
  Account.init(
    {
      name: DataTypes.STRING,
      balance: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: "Account",
      underscored: true,
    }
  );
  return Account;
};

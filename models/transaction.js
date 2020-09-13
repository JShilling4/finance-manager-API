"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init(
    {
      accountId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      payeeId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      amount: DataTypes.FLOAT,
      cleared: DataTypes.BOOLEAN,
      clearedAccountBalance: DataTypes.FLOAT,
      clearedDatetime: DataTypes.DATE,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Transaction",
      underscored: true,
    }
  );
  return Transaction;
};

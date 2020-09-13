"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payee.hasMany(models.Transaction, {
        foreignKey: { name: "payee_id", allowNull: true },
      });
    }
  }
  Payee.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Payee",
      underscored: true,
    }
  );
  return Payee;
};

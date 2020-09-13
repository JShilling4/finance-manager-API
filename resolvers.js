const { GraphQLDateTime } = require("graphql-iso-date");
const { Sequelize, Op } = require("sequelize");
const moment = require("moment");
const { makeRemoteExecutableSchema } = require("apollo-server");

const resolvers = {
  Query: {
    async getAllAccounts(root, args, { models }) {
      return models.Account.findAll();
    },
    async getAccount(root, { id }, { models }) {
      return models.Account.findByPk(id);
    },

    async getAllCategories(root, args, { models }) {
      return models.Category.findAll();
    },
    async getCategory(root, { id }, { models }) {
      return models.Category.findByPk(id);
    },

    async getAllPayees(root, args, { models }) {
      return models.Payee.findAll();
    },
    async getPayee(root, { id }, { models }) {
      return models.Payee.findByPk(id);
    },

    async getAllTransactions(root, args, { models }) {
      return models.Transaction.findAll();
    },
    async getTransaction(root, { id }, { models }) {
      return models.Transaction.findByPk(id);
    },
  },

  Transaction: {
    async account(root, args, context, info) {
      const accountPromise = await context.models.Account.findByPk(
        root.accountId
      );
      return accountPromise;
    },
    async category(root, args, context, info) {
      const categoryPromise = await context.models.Category.findByPk(
        root.categoryId
      );
      return categoryPromise;
    },
    async payee(root, args, context, info) {
      const payeePromise = await context.models.Payee.findByPk(root.payeeId);
      return payeePromise;
    },
  },

  Date: GraphQLDateTime,

  Mutation: {
    // Accounts
    async postAccount(root, args, { models }) {
      try {
        if (args.id == null) {
          return models.Account.create(args);
        } else {
          await models.Account.update(
            {
              name: args.name,
            },
            {
              where: {
                id: args.id,
              },
            }
          );
        }
        return models.Account.findByPk(args.id);
      } catch (error) {
        return error;
      }
    },
    async deleteAccount(root, args, { models }) {
      try {
        models.Account.destroy({
          where: {
            id: args.id,
          },
        });
      } catch (error) {
        return error;
      }
    },
    // Categories
    async postCategory(root, args, { models }) {
      try {
        if (args.id == null) {
          return models.Category.create(args);
        } else {
          await models.Category.update(
            {
              name: args.name,
            },
            {
              where: {
                id: args.id,
              },
            }
          );
        }
        return models.Category.findByPk(args.id);
      } catch (error) {
        return error;
      }
    },
    async deleteCategory(root, args, { models }) {
      try {
        models.Category.destroy({
          where: {
            id: args.id,
          },
        });
      } catch (error) {
        return error;
      }
    },
    // Payees
    async postPayee(root, args, { models }) {
      try {
        if (args.id == null) {
          return models.Payee.create(args);
        } else {
          await models.Payee.update(
            {
              name: args.name,
            },
            {
              where: {
                id: args.id,
              },
            }
          );
        }
        return models.Payee.findByPk(args.id);
      } catch (error) {
        return error;
      }
    },
    async deletePayee(root, args, { models }) {
      try {
        models.Payee.destroy({
          where: {
            id: args.id,
          },
        });
      } catch (error) {
        return error;
      }
    },
    // Transactions
    async postTransaction(root, args, { models }) {
      // this is a new transaction
      if (args.id == null) {
        return models.sequelize
          .transaction((t) => {
            const amountValue =
              args.type == "debit"
                ? -Math.abs(args.amount)
                : Math.abs(args.amount);
            return models.Account.update(
              {
                balance: Sequelize.literal(`balance + ${amountValue}`),
              },
              {
                where: {
                  id: args.accountId,
                },
                returning: true,
                raw: true,
              },
              { transaction: t }
            ).then((account) => {
              const bal = account[1][0].balance;
              return models.Transaction.sum(
                "amount",
                {
                  where: {
                    clearedDatetime: {
                      [Op.gt]: moment(args.clearedDatetime).toDate(),
                    },
                  },
                },
                { transaction: t }
              ).then((sum) => {
                return (
                  models.Transaction.create(
                    {
                      accountId: args.accountId,
                      categoryId: args.categoryId,
                      payeeId: args.payeeId,
                      type: args.type,
                      amount: amountValue,
                      cleared: args.cleared,
                      clearedAccountBalance: bal - sum,
                      clearedDatetime: args.clearedDatetime,
                      description: args.description,
                    },
                    { transaction: t }
                  )
                    // then update all transactions occuring after with the difference
                    .then((transaction) => {
                      models.Transaction.update(
                        {
                          clearedAccountBalance: Sequelize.literal(
                            `cleared_account_balance + ${amountValue}`
                          ),
                        },
                        {
                          where: {
                            clearedDatetime: {
                              [Op.gt]: moment(args.clearedDatetime).toDate(),
                            },
                          },
                        },
                        { transaction: t }
                      );
                      return transaction;
                    })
                );
              });
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        const originalTransaction = await models.Transaction.findByPk(args.id);
        const amountDiff = Math.abs(originalTransaction.amount) - args.amount;
        // this is an edit
        return models.sequelize
          .transaction((t) => {
            const amountValue =
              args.type == "debit"
                ? -Math.abs(args.amount)
                : Math.abs(args.amount);
            // update the account balance with difference
            return (
              models.Account.update(
                {
                  balance: Sequelize.literal(`balance + ${amountDiff}`),
                },
                {
                  where: {
                    id: args.accountId,
                  },
                },
                { transaction: t }
              )
                .then(() => {
                  // update the transaction
                  return models.Transaction.update(
                    {
                      accountId: args.accountId,
                      categoryId: args.categoryId,
                      payeeId: args.payeeId,
                      type: args.type,
                      amount: amountValue,
                      cleared: args.cleared,
                      clearedAccountBalance: Sequelize.literal(
                        `cleared_account_balance - ${originalTransaction.amount} + ${amountValue}`
                      ),
                      clearedDatetime: args.clearedDatetime,
                      description: args.description,
                    },
                    {
                      where: {
                        id: args.id,
                      },
                    },
                    { transaction: t }
                  );
                })
                // then update all transactions occuring after with the difference
                .then(() => {
                  if (amountDiff !== 0) {
                    models.Transaction.update(
                      {
                        clearedAccountBalance: Sequelize.literal(
                          `cleared_account_balance + ${amountDiff}`
                        ),
                      },
                      {
                        where: {
                          clearedDatetime: {
                            [Op.gt]: moment(args.clearedDatetime).toDate(),
                          },
                        },
                      },
                      { transaction: t }
                    );
                    return models.Transaction.findByPk(args.id);
                  }
                })
            );
          })
          .catch((err) => {
            return err;
          });
      }
    },
    async deleteTransaction(root, args, { models }) {
      const amountValue =
        args.type == "debit" ? Math.abs(args.amount) : -Math.abs(args.amount);

      try {
        await models.sequelize.transaction(async (t) => {
          // remove the transaction
          await models.Transaction.destroy(
            {
              where: { id: args.id },
            },
            { transaction: t }
          );
          // update the account balance
          await models.Account.update(
            {
              balance: Sequelize.literal(`balance + ${amountValue}`),
            },
            { where: { id: args.accountId } },
            { transaction: t }
          );

          // update all transactions that occur on the account after
          await models.Transaction.update(
            {
              clearedAccountBalance: Sequelize.literal(
                `cleared_account_balance + ${amountValue}`
              ),
            },
            {
              where: {
                clearedDatetime: {
                  [Op.gte]: moment(args.clearedDatetime).toDate(),
                },
              },
            },
            { transaction: t }
          );
        });
        return models.Account.findByPk(args.accountId);
      } catch (error) {
        return error;
      }
    },
  },
};

module.exports = resolvers;

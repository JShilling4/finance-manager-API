const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar Date

  type Account {
    id: ID!
    name: String!
    balance: Float!
  }

  type Category {
    id: ID!
    name: String!
  }

  type Payee {
    id: ID!
    name: String!
  }

  type Transaction {
    id: ID!
    account: Account!
    category: Category!
    payee: Payee
    type: String!
    amount: Float!
    cleared: Boolean!
    clearedAccountBalance: Float
    clearedDatetime: Date!
    description: String
  }

  type Query {
    getAllAccounts: [Account]
    getAccount(id: ID!): Account

    getAllCategories: [Category]
    getCategory(id: ID!): Category

    getAllTransactions: [Transaction]
    getTransaction(id: ID!): Transaction

    getAllPayees: [Payee]
    getPayee(id: ID!): Payee
  }

  type Mutation {
    postAccount(id: ID, name: String!, balance: Float!): Account!
    deleteAccount(id: ID!): Boolean

    postCategory(id: ID, name: String!): Category!
    deleteCategory(id: ID!): Boolean

    postPayee(id: ID, name: String!): Payee!
    deletePayee(id: ID!): Boolean

    postTransaction(
      id: ID
      accountId: Int!
      categoryId: Int!
      payeeId: Int
      type: String!
      amount: Float!
      cleared: Boolean!
      clearedDatetime: Date!
      description: String
    ): Transaction!
    deleteTransaction(
      id: ID!
      accountId: Int!
      categoryId: Int!
      payeeId: Int
      type: String!
      amount: Float!
      cleared: Boolean!
      clearedDatetime: Date!
      description: String
    ): Account
  }
`;

module.exports = typeDefs;

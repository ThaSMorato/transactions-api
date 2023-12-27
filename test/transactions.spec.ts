import {
  expect,
  it,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
  afterEach,
} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

const transaction = {
  title: 'new transaction in test',
  amount: 1000,
  type: 'credit',
}

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run migrate')
  })

  afterEach(() => {
    execSync('npm run migrate:rollback:all')
  })

  describe('post', () => {
    it('should create a new transaction', async () => {
      const response = await request(app.server)
        .post('/transactions')
        .send(transaction)

      expect(response.statusCode).toBe(201)
    })
  })

  describe('get', () => {
    it('should be able to list all transactions', async () => {
      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send(transaction)

      const cookies = createTransactionResponse.get('Set-Cookie')

      const getTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)

      expect(getTransactionsResponse.statusCode).toBe(200)
      expect(getTransactionsResponse.body).toEqual({
        transactions: [
          expect.objectContaining({
            title: transaction.title,
            amount: transaction.amount,
          }),
        ],
      })
    })
    it('should be able to get a specific transaction', async () => {
      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send(transaction)

      const cookies = createTransactionResponse.get('Set-Cookie')

      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)

      expect(listTransactionsResponse.statusCode).toBe(200)
      expect(listTransactionsResponse.body).toEqual({
        transactions: [
          expect.objectContaining({
            title: transaction.title,
            amount: transaction.amount,
          }),
        ],
      })

      const transactionId = listTransactionsResponse.body.transactions[0].id

      const getTransactionResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)

      expect(getTransactionResponse.statusCode).toBe(200)
      expect(getTransactionResponse.body).toEqual({
        transaction: expect.objectContaining({
          title: transaction.title,
          amount: transaction.amount,
        }),
      })
    })
    it('should be able to get the summary', async () => {
      const debitTransaction = {
        title: 'Debit Transaction',
        amount: 100,
        type: 'debit',
      }

      const createTransactionResponse = await request(app.server)
        .post('/transactions')
        .send(transaction)

      const cookies = createTransactionResponse.get('Set-Cookie')

      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send(debitTransaction)

      const getTransactionsResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)

      const expectedAmount = transaction.amount - debitTransaction.amount

      expect(getTransactionsResponse.statusCode).toBe(200)
      expect(getTransactionsResponse.body).toEqual({
        summary: {
          amount: expectedAmount,
        },
      })
    })
  })
})

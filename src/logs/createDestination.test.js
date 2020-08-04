import fetch from 'node-fetch'
import platformConfig from '../config'
import { getLogDestination } from './'

jest.mock('node-fetch', () =>
  jest.fn().mockReturnValue(
    Promise.resolve({
      ok: true,
      json: async () => ({})
    })
  )
)

afterAll(() => jest.restoreAllMocks())

describe('getLogDestination', () => {
  test('it creates the log destination URL', async () => {
    const opts = {
      tenantUid: 'tenant123',
      appUid: 'app123',
      serviceName: 'serviceName',
      regionName: 'region',
      stageName: 'stage',
      accountId: 'ACCOUNT_ID',
      accessKey: 'accessKey'
    }

    await getLogDestination(opts)
    expect(fetch).toBeCalledWith(`${platformConfig.logDestinationUrl}destinations/create`, {
      method: 'POST',
      body: JSON.stringify({
        tenantUid: 'tenant123',
        appUid: 'app123',
        serviceName: 'serviceName',
        stageName: 'stage',
        regionName: 'region',
        accountId: 'ACCOUNT_ID'
      }),
      headers: {
        Authorization: 'bearer accessKey',
        'Content-Type': 'application/json'
      }
    })
  })
})

import fetch from 'node-fetch'
import { getAccessKeyForTenant } from '../accessKeys'
import Deployment from './'
import { version as packageJsonVersion } from '../../package.json'

jest.mock('../accessKeys', () => ({
  getAccessKeyForTenant: jest.fn().mockReturnValue('access-key')
}))
jest.mock('node-fetch', () =>
  jest.fn().mockReturnValue(
    Promise.resolve({
      ok: true,
      json: jest.fn().mockReturnValue(Promise.resolve('object'))
    })
  )
)

describe('Deployment', () => {
  it('constructs with correct defaults', () => {
    const deployment = new Deployment()
    expect(deployment.data).toEqual({
      versionFramework: null,
      versionEnterprisePlugin: null,
      versionSDK: packageJsonVersion,
      serverlessFile: null,
      serverlessFileName: null,
      tenantUid: null,
      appUid: null,
      tenantName: null,
      appName: null,
      serviceName: null,
      stageName: null,
      regionName: null,
      logsRoleArn: null,
      status: null,
      error: null,
      archived: false,
      provider: { type: 'aws' },
      functions: {},
      subscriptions: [],
      resources: {},
      layers: {},
      plugins: [],
      safeguards: [],
      secrets: [],
      outputs: {},
      custom: {}
    })
  })

  it('get returns the data object', () => {
    const deployment = new Deployment()
    expect(deployment.data).toEqual(deployment.get())
  })

  it('set updates the data object', () => {
    const deployment = new Deployment()
    deployment.set({ versionEnterprisePlugin: '1000000' })
    expect(deployment.data.versionEnterprisePlugin).toEqual('1000000')
  })

  it('setFunction adds to the data object', () => {
    const deployment = new Deployment()
    deployment.setFunction({
      name: 'func',
      description: 'desc',
      custom: {
        handler: 'handler.hello'
      }
    })
    expect(deployment.data.functions).toEqual({
      func: {
        name: 'func',
        description: 'desc',
        type: 'awsLambda',
        timeout: null,
        custom: {
          handler: 'handler.hello',
          memorySize: null,
          runtime: null,
          role: null,
          onError: null,
          awsKmsKeyArn: null,
          tags: {},
          vpc: { securityGroupIds: [], subnetIds: [] },
          layers: []
        }
      }
    })
  })

  it('setSubscription adds to the data object', () => {
    const deployment = new Deployment()
    deployment.data.functions.func = {}
    deployment.setSubscription({
      type: 'aws.apigateway.http',
      function: 'func',
      custom: {
        path: '/',
        method: 'get',
        restApiId: 'XYZ'
      }
    })
    expect(deployment.data.subscriptions).toEqual([
      {
        type: 'aws.apigateway.http',
        function: 'func',
        custom: {
          path: '/',
          method: 'get',
          restApiId: 'XYZ',
          cors: false
        }
      }
    ])
  })

  it('save POSTs to backend', async () => {
    const unsavedDeployment = new Deployment()
    unsavedDeployment.set({
      tenantName: 'tenant',
      appName: 'app',
      serviceName: 'service',
      stageName: 'stage',
      regionName: 'region'
    })
    const { deployment, dashboardUrl } = await unsavedDeployment.save()
    expect(dashboardUrl).toEqual(
      'https://dashboard.serverless.com/tenants/tenant/applications/app/services/service/stage/stage/region/region'
    )
    expect(deployment).toEqual('object')
    expect(fetch).toBeCalledWith(
      'https://api.serverless.com/core/tenants/tenant/applications/app/services/service/stages/stage/regions/region/deployments',
      {
        body: JSON.stringify({
          versionFramework: null,
          versionEnterprisePlugin: null,
          versionSDK: packageJsonVersion,
          serverlessFile: null,
          serverlessFileName: null,
          tenantUid: null,
          appUid: null,
          tenantName: 'tenant',
          appName: 'app',
          serviceName: 'service',
          stageName: 'stage',
          regionName: 'region',
          logsRoleArn: null,
          status: null,
          error: null,
          archived: false,
          provider: { type: 'aws' },
          functions: {},
          subscriptions: [],
          resources: {},
          layers: {},
          plugins: [],
          safeguards: [],
          secrets: [],
          outputs: {},
          custom: {}
        }),
        headers: { Authorization: 'bearer access-key' },
        method: 'POST'
      }
    )
    expect(getAccessKeyForTenant).toBeCalledWith('tenant')
  })
})

import test from 'japa'
import AdonisApplication from 'adonis-provider-tester'
import NATSProvider from '../providers/NatsProvider'
import NATSProviderContract from '@ioc:Adonis/Addons/NATS'
const sleep = (ms: number = 3000) => new Promise((res) => setTimeout(() => res(true), ms))
class UserServiceClassServer {
  public static serviceName = 'UserServiceClassServer'

  public users: [1, 2, 3]
  public async getUsersIDs() {
    await sleep()
    return this.users
  }
  public async getTestVars<T>(data: T): Promise<T> {
    await sleep()
    return data
  }
}

class UserServiceClassClient extends UserServiceClassServer {
  constructor() {
    super()
  }
}

test.group('RedisRPC', (group) => {
  let adonisApp: AdonisApplication
  let nats: typeof NATSProviderContract
  let UserServiceServer: UserServiceClassServer
  let UserServiceClient: UserServiceClassClient
  group.before(async () => {
    adonisApp = await AdonisApplication.initApplication(
      // @ts-ignore
      [NATSProvider],
      [
        {
          configName: 'nats',
          appConfig: {
            // nodeID: 'node-1',
            transporter: 'nats://localhost:4222',
            logLevel: 'error',
            requestTimeout: 30 * 1000,
            errorHandler(err, _info) {
              console.error('NatsBroker', err?.message, err)
              // console.error('Log the error:', err)
              throw err // Throw further
            },
          },
        },
      ]
    )
    nats = adonisApp.application.container.use('Adonis/Addons/NATS')
    UserServiceServer = await nats.addServer<UserServiceClassServer>(UserServiceClassServer)

    UserServiceClient = nats.addClient<UserServiceClassClient>(
      UserServiceClassClient,
      UserServiceClassServer
    )
  })

  group.after(async () => {
    await adonisApp.stopServer()
  })

  test('NATS get remote static variable', async (_assert) => {
    const userIds = await UserServiceClient.getUsersIDs()
    _assert.equal(userIds, UserServiceServer.users)
  }).timeout(15000)
  test('NATS get passed variable', async (_assert) => {
    const testVar = [4, 5, 6]
    const result = await UserServiceClient.getTestVars<{ testVar: number[] }>({ testVar })
    console.log(result)
    _assert.equal(result.testVar.length, 3)
  }).timeout(15000)
})

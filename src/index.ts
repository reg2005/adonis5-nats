import { ServiceBroker, BrokerOptions } from 'moleculer'
import { Application } from '@adonisjs/application'
const debugServer = require('debug')('adonis:nats:server')
const debugClient = require('debug')('adonis:nats:client')
export class BrokerInit {
  public broker: ServiceBroker
  public isBrokerInit = false
  constructor(protected app: Application) {}
  public init(brokerOptions: Partial<BrokerOptions> = {}) {
    const config: BrokerOptions = this.app.container.use('Adonis/Core/Config').get('nats', {})
    this.broker = new ServiceBroker({ ...config, ...brokerOptions })
    return this
  }
  public addClient<T>(clientClass, serverClass): T {
    const cuid = this.app.helpers.cuid
    const self = this
    this.isBrokerInit = false
    clientClass.prototype.start = async function () {
      if (!this.isBrokerInit) {
        debugClient('client broker first start')
        this.isBrokerInit = true
        self.init({ nodeID: `${serverClass.serviceName}-client-${cuid()}` })
        await self.broker.start()
      }
    }
    for (const method of Object.getOwnPropertyNames(serverClass.prototype)) {
      if (method !== 'constructor') {
        debugClient(`add method: ${method}`)
        clientClass.prototype[method] = async function (body: {} = {}) {
          await this.start()
          const callName = `${serverClass.serviceName}.${method}`
          const logName = `${callName}`
          console.time(logName)
          try {
            const result = await self.broker.call(`${serverClass.serviceName}.${method}`, body)
            debugClient(`result for method: ${result}`)
            console.timeEnd(logName)
            return result
          } catch (error) {
            console.timeEnd(logName)
            throw error
          }
        }
      }
    }
    return new clientClass()
  }
  public async addServer(classProto) {
    const cuid = this.app.helpers.cuid
    this.init({ nodeID: `${classProto.serviceName}-${cuid()}` })
    const actions = {}
    const classInstance = new classProto()
    for (const method of Object.getOwnPropertyNames(classProto.prototype)) {
      if (method !== 'constructor') {
        actions[method] = async (ctx) => {
          debugServer(`handle action: ${classProto.serviceName}.${method}`)
          return await classInstance[method](ctx.params)
        }
      }
    }
    ServiceSchema
    debugServer(`add actions: ${classProto.serviceName}`, Object.keys(actions))
    this.broker.createService({
      ...(classProto?.serviceOptions || {}),
      name: classProto.serviceName,
      actions,
    })
    await this.broker.start()
    return classInstance
  }
}

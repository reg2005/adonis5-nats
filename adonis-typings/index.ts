declare module '@ioc:Adonis/Addons/NATS' {
  import { ServiceBroker, BrokerOptions } from 'moleculer'
  export class BrokerInit {
    public broker: ServiceBroker
    public init(brokerOptions: Partial<BrokerOptions>): Promise<this>
    public addServer<T>(classProto): Promise<T>
    public addClient<T>(clientClassProto, serverClassProto): Promise<T>
  }
  const instance: BrokerInit
  export default instance
}

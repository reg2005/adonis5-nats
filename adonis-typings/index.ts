declare module '@ioc:Adonis/Addons/NATS' {
  import { ServiceBroker, BrokerOptions, ServiceSchema } from 'moleculer'
  export class BrokerInit {
    public broker: ServiceBroker
    public init(brokerOptions: Partial<BrokerOptions>): Promise<this>
    public addServer<T>(
      classProto,
      brokerOptions?: Partial<BrokerOptions>,
      serviceOptions?: Partial<ServiceSchema>
    ): Promise<T>
    public addClient<T>(
      clientClassProto,
      serverClassProto,
      brokerOptions?: Partial<BrokerOptions>
    ): T
  }
  const instance: BrokerInit
  export default instance
}

import { BrokerInit } from '../src'
import { Application } from '@adonisjs/application'

/**
 * NATS provider
 */
export default class NATSProvider {
  public static needsApplication = true
  constructor(protected app: Application) {}

  public async register(): Promise<void> {
    this.app.container.singleton('Adonis/Addons/NATS', () => {
      return new BrokerInit(this.app)
    })
  }
  public async boot(): Promise<void> {}
}

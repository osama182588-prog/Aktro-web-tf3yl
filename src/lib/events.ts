// Shared Event System
// نظام الأحداث المشترك بين الموقع والبوت
// يضمن المزامنة الفورية بين جميع المكونات

import { EventEmitter } from 'events'

// Event types for type safety
export interface SystemEvents {
  // Activation events (website → bot)
  'activation:new_request': {
    discordId: string
    discordUsername: string
    realName: string
    characterName: string
    requestId: string
  }

  // Admin action events (website → bot)
  'activation:approved': {
    discordId: string
    discordUsername: string
    reviewedBy: string
    requestId: string
  }
  'activation:rejected': {
    discordId: string
    discordUsername: string
    reviewedBy: string
    requestId: string
  }
  'activation:edit_requested': {
    discordId: string
    discordUsername: string
    reviewedBy: string
    requestId: string
  }

  // Bot events (bot → website)
  'bot:ready': {
    tag: string
  }
  'bot:action': {
    action: string
    discordId: string
    adminId: string
    requestId: string
  }
}

// Create singleton event bus
class SystemEventBus extends EventEmitter {
  private static instance: SystemEventBus

  private constructor() {
    super()
    this.setMaxListeners(20)
  }

  static getInstance(): SystemEventBus {
    if (!SystemEventBus.instance) {
      SystemEventBus.instance = new SystemEventBus()
    }
    return SystemEventBus.instance
  }

  // Type-safe emit
  emitEvent<K extends keyof SystemEvents>(event: K, data: SystemEvents[K]): boolean {
    return this.emit(event, data)
  }

  // Type-safe listener
  onEvent<K extends keyof SystemEvents>(event: K, listener: (data: SystemEvents[K]) => void): this {
    return this.on(event, listener)
  }
}

export const eventBus = SystemEventBus.getInstance()

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationEventService {
  private readonly _initializeNotifications = new Subject<void>();
  private readonly _disconnectNotifications = new Subject<void>();

  // Observable streams
  readonly initializeNotifications$ = this._initializeNotifications.asObservable();
  readonly disconnectNotifications$ = this._disconnectNotifications.asObservable();

  // Methods to trigger events
  triggerInitialize(): void {
    this._initializeNotifications.next();
  }

  triggerDisconnect(): void {
    this._disconnectNotifications.next();
  }
}
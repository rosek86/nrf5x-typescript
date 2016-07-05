/// <reference path="../node/node.d.ts" />

declare module "nrf5x" {		
  import * as events from "events";

  interface IOpenAdapterOptions {
    baudRate?:               number;
    parity?:                 string;
    flowControl?:            string;
    eventInterval?:          number;
    logLevel?:               string;
    retransmissionInterval?: number;
    responseTimeout?:        number;
    enableBLE?:              boolean;
  }

  interface IAddress {
    address: string;
    type: string;
  }

  interface IEnableBleOptions {
    gap_enable_params: {
      periph_conn_count: number;
      central_conn_count: number;
      central_sec_count: number;
    }
    gatts_enable_params: {
      service_changed: boolean;
      attr_tab_size: any;//this._bleDriver.BLE_GATTS_ATTR_TAB_SIZE_DEFAULT,
    }
    common_enable_params: {
      conn_bw_counts: any; 
      vs_uuid_count: number;
    }
  }

  interface IScanParams {
    active:   boolean;
    interval: number;
    window:   number;
    timeout:  number; // in seconds
  }

  interface IConnParams {
    min_conn_interval: number;
    max_conn_interval: number;
    slave_latency:     number;
    conn_sup_timeout:  number;
  }

  interface IConnectOptions {
    scanParams: IScanParams;
    connParams: IConnParams;
  }

  interface IAdvertOptions {
    channelMask: string[];
    interval: number;
    timeout: number;
    connectable: boolean;
    scannable: boolean;
  }

  enum ELogLevel {
    TRACE   = 0,
    DEBUG   = 1,
    INFO    = 2,
    WARNING = 3,
    ERROR   = 4,
    FATAL   = 5
  }

  class Driver {

  }

  export var driver: Driver;

  namespace api {
    
    class AdapterFactory extends events.EventEmitter {
      public static getInstance(): AdapterFactory;
      public getAdapters(callback: (err?: any, adapters?: Adapter[]) => void): void;

      public on(event: string, listener: Function): this;
      public on(event: 'error', listener: (err: any) => void): this;
      public on(event: 'added', listener: (adapter: Adapter) => void): this;
      public on(event: 'removed', listener: (adapter: Adapter) => void): this;
      public on(event: 'adapterOpened', listener: (adapter: Adapter) => void): this;
      public on(event: 'adapterClosed', listener: (adapter: Adapter) => void): this;
    }

    class AdapterState {
      public instanceId: string;
      public port: string;
      public baudRate: number;
      public parity: string;
      public flowControl: string;	
			
      public address: IAddress;
      public addressType: string;
      public name: string;
			
      public available: boolean;
      public scanning: boolean;
      public advertising: boolean;
      public connecting: boolean;
			
      public firmwareVersion: {
        version_number: number;
        company_id: number;
        subversion_number: number;
      }
    }

    class Security {
      static getInstance(bleDriver: Driver): Security;
      generateKeyPair(): any; //Driver.eccGenerateKeypair()
      generatePublicKey(privateKey: any): any; //Driver.eccComputePublicKey(privateKey);
      generateSharedSecret(privateKey: any, publicKey: any): any //Driver.eccComputeSharedSecret(privateKey, publicKey);
    }
		
    interface IEvent {
      id: number;
      data: any;
      time: any;
      scan_rsp: any;
      rssi: number;
      adv_type: string;
    }

    class Device {
      public instanceId: string;
      public address: string;
      public addressType: string;
      public role: 'peripheral' | 'central';
      public connectionHandle: any;
      public minConnectionInterval: number;
      public maxConnectionInterval: number;
      public slaveLatency: number;
      public connectionSupervisionTimeout: number;
      
      public name:string;
      public services: Service[];
      public flags: string[];
			
      public adData: {
        BLE_GAP_AD_TYPE_FLAGS: string[];
        BLE_GAP_AD_TYPE_MANUFACTURER_SPECIFIC_DATA: number[];
        BLE_GAP_AD_TYPE_SERVICE_DATA: number[];
      }
			
      public scanResponse: boolean;
      public connected: boolean;
      public paired: boolean;
      public ownPeriphInitiatedPairingPending: boolean;
			
      public rssi: number;
      public rssi_level: number;

      public time: any;
      public advType: string;
			
      public processEventData(evt: IEvent): void;
      //"time":"2016-05-24T09:02:32.463Z",	
    }

    class Service {
      public instanceId: string;
      public deviceInstanceId: string;
      public uuid: string;
      public type: 'primary' | 'secondary';
      public startHandle: number;
      public endHandle: number;
    }

    class ServiceFactory {
      public createService(uuid: string, serviceType?: 'primary' | 'secondary'): Service;
      public createCharacteristic(service: Service, uuid: string, value: any, properties: any, options: any): Characteristic;
      public createDescriptor(characteristic: Characteristic, uuid: string, value: any, options: any): Descriptor;
    }

    class Characteristic {
      public instanceId: string;
      public serviceInstanceId: string;

      public uuid: string;
      public value: number[];
      public properties: {
        broadcast: boolean;
        read: boolean;
        write_wo_resp: boolean;
        write: boolean;
        notify: boolean;
        indicate: boolean;
        auth_signed_wr: boolean;
      };

      public readPerm: any;
      public writePerm: any;
      public variableLength: any;
      public maxLength: any;

      public handle: number;
      public declarationHandle: any;
    }

    class Descriptor {
      public instanceId: string;
      public characteristicInstanceId: string;

      public uuid: string;
      public value: any;

      public readPerm: any;
      public writePerm: any;
      public variableLength: any;
      public maxLength: any;

      public handle: any;
    }

    interface IError {
      message: string;
      description: string;
    }

    interface IAdapterStatus {
      id: number;
    }

    class Adapter extends events.EventEmitter {
      public instanceId: string;
      public state: AdapterState;
      public notSupportedMessage: string;

      public computeSharedSecret(peerPublicKey): any; // TODO
      public computePublicKey(): any; // TODO
      public deleteKeys(): void;

      public open(options?: IOpenAdapterOptions, callback?: (err?: any) => void): void;
      public close(callback?: (err?: any) => void): void;

      public getStats(): any; // TODO _adapter.getStats()

      public enableBLE(options?: IEnableBleOptions, callback?: (err?: any, params?: any, app_ram_base?: any) => void): void; // TODO

      public getState(callback?: (err?: any, state?: AdapterState) => void): void;

      public setName(name: string, callback?: (err?: any) => void): void;
      public setAddress(address: string, type: string, callback?: (err?: any) => void): void;

      public getDevices(): Device[];
      public getDevice(deviceInstanceId: string): Device;

      public startScan(options?: IScanParams, callback?: (err?: any) => void): void;
      public stopScan(callback?: (err?: any) => void): void;

      public connect(deviceAddress: string|IAddress, options: IConnectOptions, callback?: (err?: any) => void): void;
      public cancelConnect(callback: (err?: any) => void): any;

      public startAdvertising(options: IAdvertOptions, callback?: (err?: any) => void): any;
      public setAdvertisingData(advData, scanRespData, callback?: (err?: any) => void): void;
      // const advDataStruct = Array.from(AdType.convertToBuffer(advData));
      // const scanRespDataStruct = Array.from(AdType.convertToBuffer(scanRespData));
      public stopAdvertising(callback?: (err?: any) => void): void;

      // Central/peripheral
      public disconnect(deviceInstanceId: string, callback?: (err?: any) => void): void;
      public updateConnectionParameters(deviceInstanceId: string, options: IConnParams, callback?: (err?: any) => void): any;

      // Central role
      public rejectConnParams(deviceInstanceId: string, callback: (err?: any) => void): void;
      public authenticate(deviceInstanceId: string, secParams: any, callback: (err?: any) => void): void;
      public replySecParams(deviceInstanceId: string, secStatus: any, secParams: any, secKeyset: any, callback: (err?: any) => void): void;
      public replyAuthKey(deviceInstanceId: string, keyType: any, key: any, callback: (err?: any) => void): void;
      public replyLescDhkey(deviceInstanceId: string, dhkey, callback: (err?: any) => void): void;
      public notifyKeypress(deviceInstanceId: string, notificationType, callback: (err?: any) => void): void;
      public getLescOobData(deviceInstanceId: string, ownPublicKey, callback: (err?: any) => void): void;
      public setLescOobData(deviceInstanceId: string, ownOobData, peerOobData, callback: (err?: any) => void): void;
      public encrypt(deviceInstanceId: string, masterId, encInfo, callback: (err?: any) => void): void;
      public secInfoReply(deviceInstanceId: string, encInfo, idInfo, signInfo, callback: (err?: any) => void): void;

      public setServices(services: Service[], callback: (err?: any) => void): void;

      public getService(serviceInstanceId: string): Service;
      public getServices(deviceInstanceId: string, callback?: (err?: any, services?: Service[]) => void): void;
			
      public getCharacteristic(characteristicId: string): Characteristic;
    	public getCharacteristics(serviceId: string, callback?: (err?: any, characteristics?: Characteristic[]) => void): void;

      public getDescriptor(descriptorId: string): Descriptor;
      public getDescriptors(characteristicId: string, callback?: (err?: any, descriptors?: Descriptor[]) => void): void;

    	public readCharacteristicValue(characteristicId: string, callback: (err?: any, readBytes?: number[]) => void): void;

    	public writeCharacteristicValue(characteristicId: string, value: number[], ack: boolean, completeCallback: (err?: any) => void, deviceNotifiedOrIndicated?: (device: Device, attribute: Characteristic | Descriptor) => void): void;

      public readDescriptorValue(descriptorId: string, callback: (/*TODO*/) => void): void;
      public writeDescriptorValue(descriptorId: string, value: Buffer, ack: boolean, callback: (err?: any) => void): void;

      // Only for GATTC role
      public startCharacteristicsNotifications(characteristicId: string, requireAck: boolean, callback: (err?: any) => void): void;
    	public stopCharacteristicsNotifications(characteristicId: string, callback: (err?: any) => void): void;

      public on(event: string, listener: Function): this;
    	public on(event: 'error', listener: (err: IError) => void): this;
    	public on(event: 'stateChanged', listener: (state: AdapterState) => void): this;
      public on(event: 'opened', listener: (adapter: Adapter) => void): this;
      public on(event: 'closed', listener: (adapter: Adapter) => void): this;
      public on(event: 'status', listener: (status: IAdapterStatus) => void): this;
      public on(event: 'logMessage', listener: (logLevel: ELogLevel, message: string) => void): this;
      public on(event: 'deviceConnected', listener: (device: Device) => void): this;
      public on(event: 'deviceDisconnected', listener: (device: Device) => void): this;
      public on(event: 'connParamUpdate', listener: (device: Device) => void): this;
      public on(event: 'secParamsRequest', listener: (device: Device, peer_params: any) => void): this;
      public on(event: 'connSecUpdate', listener: (device: Device, conn_sec: any) => void): this;
      public on(event: 'securityChanged', listener: (device: Device, authParams: any) => void): this;
      public on(event: 'authStatus', listener: (device: Device, authStatus: any) => void): this;
      public on(event: 'passkeyDisplay', listener: (device: Device, matchRequest: any, passkey: any) => void): this;
      public on(event: 'authKeyRequest', listener: (device: Device, keyType: any) => void): this;
      public on(event: 'keyPressed', listener: (device: Device, kpNot: any) => void): this;
      public on(event: 'lsecDhkeyRequest', listener: (device: Device, pkPeer: any, oobdReq) => void): this;
      public on(event: 'secInfoRequest', listener: (device: Device, evt: any) => void): this;
      public on(event: 'securityRequest', listener: (device: Device, evt: any) => void): this;
      public on(event: 'connParamUpdateRequest', listener: (device: Device, connParam: any) => void): this;
      public on(event: 'deviceDiscovered', listener: (discoveredDevice: Device) => void): this;
      public on(event: 'advertiseTimedOut', listener: () => void): this;
      public on(event: 'scanTimedOut', listener: () => void): this;
      public on(event: 'connectTimedOut', listener: (deviceAddress: IAddress) => void): this;
      public on(event: 'securityRequestTimedOut', listener: (device: Device) => void): this;
      public on(event: 'serviceAdded', listener: (newService: Service) => void): this;
      public on(event: 'characteristicAdded', listener: (newCharacteristic: Characteristic) => void): this;
      public on(event: 'characteristicValueChanged', listener: (characteristic: Characteristic) => void): this;
      public on(event: 'descriptorValueChanged', listener: (descriptor: Descriptor) => void): this;
      public on(event: 'deviceNotifiedOrIndicated', listener: (remoteDevice: Device, characteristic: Characteristic) => void): this;	
    }
  }
}

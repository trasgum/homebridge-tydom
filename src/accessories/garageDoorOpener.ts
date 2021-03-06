import {
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicSetCallback,
  CharacteristicValue,
  Service
} from 'hap-nodejs';
import TydomController from 'src/controller';
import {PlatformAccessory} from 'src/typings/homebridge';
import {
  addAccessoryService,
  setupAccessoryIdentifyHandler,
  setupAccessoryInformationService
} from 'src/utils/accessory';
import {debugSet, debugSetResult} from 'src/utils/debug';

export const setupGarageDoorOpener = (accessory: PlatformAccessory, controller: TydomController): void => {
  const {context} = accessory;
  const {client} = controller;

  const {deviceId, endpointId} = context;
  setupAccessoryInformationService(accessory, controller);
  setupAccessoryIdentifyHandler(accessory, controller);

  // Add the actual accessory Service
  const service = addAccessoryService(accessory, Service.Switch, `${accessory.displayName}`, true);
  // State
  // const state = {
  //   isOn: false
  // };
  service
    .getCharacteristic(Characteristic.On)
    // .on(CharacteristicEventTypes.GET, async (callback: NodeCallback<CharacteristicValue>) => {
    //   callback(null, state.isOn);
    // })
    .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
      debugSet(Characteristic.On, service, value);
      if (!value) {
        callback();
        return;
      }
      try {
        await client.put(`/devices/${deviceId}/endpoints/${endpointId}/data`, [
          {
            name: 'levelCmd',
            value: 'TOGGLE'
          }
        ]);
        debugSetResult(Characteristic.On, service, value);
        callback();
        setTimeout(() => {
          service.updateCharacteristic(Characteristic.On, false);
        }, 1000);
      } catch (err) {
        callback(err);
      }
    })
    .updateValue(false);
};

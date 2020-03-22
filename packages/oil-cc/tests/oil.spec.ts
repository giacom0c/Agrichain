// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Oil, OilController } from '../src';

describe('Oil', () => {
  let adapter: MockControllerAdapter;
  let oilCtrl: ConvectorControllerClient<OilController>;
  
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    oilCtrl = ClientFactory(OilController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'OilController',
        name: join(__dirname, '..')
      }
    ]);

    adapter.addUser('Test');
  });
  
  it('should create a default model', async () => {
    const modelSample = new Oil({
      id: uuid(),
      name: 'Test',
      created: Date.now(),
      modified: Date.now()
    });

    await oilCtrl.$withUser('Test').create(modelSample);
  
    const justSavedModel = await adapter.getById<Oil>(modelSample.id);
  
    expect(justSavedModel.id).to.exist;
  });
});
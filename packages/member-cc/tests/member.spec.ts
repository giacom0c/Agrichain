// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Member, MemberController } from '../src';

describe('Member', () => {
  let adapter: MockControllerAdapter;
  let memberCtrl: ConvectorControllerClient<MemberController>;
  
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    memberCtrl = ClientFactory(MemberController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'MemberController',
        name: join(__dirname, '..')
      }
    ]);

    adapter.addUser('Test');
  });
  
  it('should create a default model', async () => {
    const modelSample = new Member({
      id: uuid(),
      name: 'Test',
      created: Date.now(),
      modified: Date.now()
    });

    await memberCtrl.$withUser('Test').create(modelSample);
  
    const justSavedModel = await adapter.getById<Member>(modelSample.id);
  
    expect(justSavedModel.id).to.exist;
  });
});
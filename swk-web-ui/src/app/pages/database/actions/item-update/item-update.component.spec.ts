/*
 * @Description: spec
 * @Author: RXC 廖云江
 * @Date: 2019-12-18 17:11:55
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-12-18 17:18:11
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItemUpdateComponent } from './item-update.component';

describe('ItemUpdateComponent', () => {
  let component: ItemUpdateComponent;
  let fixture: ComponentFixture<ItemUpdateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemUpdateComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

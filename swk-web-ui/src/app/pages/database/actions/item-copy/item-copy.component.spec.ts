/*
 * @Description: spec
 * @Author: RXC 廖云江
 * @Date: 2019-12-18 17:11:55
 * @LastEditors  : RXC 廖云江
 * @LastEditTime : 2019-12-19 10:56:27
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ItemCopyComponent } from './item-copy.component';

describe('ItemCopyComponent', () => {
  let component: ItemCopyComponent;
  let fixture: ComponentFixture<ItemCopyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemCopyComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OperateListComponent } from './operate-list.component';

describe('OperateListComponent', () => {
  let component: OperateListComponent;
  let fixture: ComponentFixture<OperateListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OperateListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

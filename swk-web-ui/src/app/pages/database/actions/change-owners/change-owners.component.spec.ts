import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChangeOwnersComponent } from './change-owners.component';

describe('ChangeOwnersComponent', () => {
  let component: ChangeOwnersComponent;
  let fixture: ComponentFixture<ChangeOwnersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeOwnersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeOwnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

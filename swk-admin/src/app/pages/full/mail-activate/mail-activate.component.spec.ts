import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MailActivateComponent } from './mail-activate.component';

describe('MailActivateComponent', () => {
  let component: MailActivateComponent;
  let fixture: ComponentFixture<MailActivateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MailActivateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailActivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

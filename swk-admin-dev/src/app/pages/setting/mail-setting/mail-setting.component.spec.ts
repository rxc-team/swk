import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MailSettingComponent } from './mail-setting.component';

describe('MailSettingComponent', () => {
  let component: MailSettingComponent;
  let fixture: ComponentFixture<MailSettingComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [MailSettingComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(MailSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

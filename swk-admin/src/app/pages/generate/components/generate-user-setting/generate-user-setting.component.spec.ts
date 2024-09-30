import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateUserSettingComponent } from './generate-user-setting.component';

describe('GenerateUserSettingComponent', () => {
  let component: GenerateUserSettingComponent;
  let fixture: ComponentFixture<GenerateUserSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateUserSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateUserSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

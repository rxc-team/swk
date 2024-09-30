import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateFieldSettingComponent } from './generate-field-setting.component';

describe('GenerateFieldSettingComponent', () => {
  let component: GenerateFieldSettingComponent;
  let fixture: ComponentFixture<GenerateFieldSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateFieldSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateFieldSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

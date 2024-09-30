import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateOptionSettingComponent } from './generate-option-setting.component';

describe('GenerateOptionSettingComponent', () => {
  let component: GenerateOptionSettingComponent;
  let fixture: ComponentFixture<GenerateOptionSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateOptionSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateOptionSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

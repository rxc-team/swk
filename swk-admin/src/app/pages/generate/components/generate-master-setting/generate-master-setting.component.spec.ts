import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateMasterSettingComponent } from './generate-master-setting.component';

describe('GenerateMasterSettingComponent', () => {
  let component: GenerateMasterSettingComponent;
  let fixture: ComponentFixture<GenerateMasterSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateMasterSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateMasterSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateMpSaveComponent } from './generate-mp-save.component';

describe('GenerateMpSaveComponent', () => {
  let component: GenerateMpSaveComponent;
  let fixture: ComponentFixture<GenerateMpSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateMpSaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateMpSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

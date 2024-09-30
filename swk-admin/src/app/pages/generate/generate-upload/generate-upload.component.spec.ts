import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateUploadComponent } from './generate-upload.component';

describe('GenerateCsvReadComponent', () => {
  let component: GenerateUploadComponent;
  let fixture: ComponentFixture<GenerateUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateUploadComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

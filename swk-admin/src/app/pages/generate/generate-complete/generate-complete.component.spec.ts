import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCompleteComponent } from './generate-complete.component';

describe('GenerateCompleteComponent', () => {
  let component: GenerateCompleteComponent;
  let fixture: ComponentFixture<GenerateCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateCompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateDsSetComponent } from './generate-ds-set.component';

describe('GenerateDsSetComponent', () => {
  let component: GenerateDsSetComponent;
  let fixture: ComponentFixture<GenerateDsSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateDsSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateDsSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

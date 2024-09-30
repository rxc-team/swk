import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateDsSaveComponent } from './generate-ds-save.component';

describe('GenerateDsSaveComponent', () => {
  let component: GenerateDsSaveComponent;
  let fixture: ComponentFixture<GenerateDsSaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateDsSaveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateDsSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

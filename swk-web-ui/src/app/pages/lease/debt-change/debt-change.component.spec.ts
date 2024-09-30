import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtChangeComponent } from './debt-change.component';

describe('DebtChangeComponent', () => {
  let component: DebtChangeComponent;
  let fixture: ComponentFixture<DebtChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtChangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

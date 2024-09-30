import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpSpinComponent } from './http-spin.component';

describe('HttpSpinComponent', () => {
  let component: HttpSpinComponent;
  let fixture: ComponentFixture<HttpSpinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HttpSpinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpSpinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

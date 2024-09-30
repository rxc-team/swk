import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpireComponent } from './expire.component';

describe('ExpireComponent', () => {
  let component: ExpireComponent;
  let fixture: ComponentFixture<ExpireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

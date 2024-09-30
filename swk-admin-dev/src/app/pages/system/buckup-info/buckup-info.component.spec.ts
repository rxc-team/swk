import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuckupInfoComponent } from './buckup-info.component';

describe('BuckupInfoComponent', () => {
  let component: BuckupInfoComponent;
  let fixture: ComponentFixture<BuckupInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuckupInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuckupInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
